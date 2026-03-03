"use server";

import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import type { AttachmentEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { s3 } from "@/lib/aws";
import { prisma } from "@/lib/prisma";
import { ticketPath } from "@/path";
import { ACCEPTED, MAX_SIZE } from "../constants";
import { isComment, isTicket } from "../types";
import { generateS3Key } from "../utils/generate-s3-key";
import { sizeInMB } from "../utils/size";
import { getOrganizationIdByAttachment } from "../utils/helpers";

const createAttachmentsSchema = z.object({
  files: z
    .custom<FileList>()
    .transform((files) => Array.from(files))
    .transform((files) => files.filter((file) => file.size > 0))
    .refine(
      (files) => files.every((file) => sizeInMB(file.size) <= MAX_SIZE),
      `The maximum file size is ${MAX_SIZE}MB`,
    )
    .refine(
      (files) => files.every((file) => ACCEPTED.includes(file.type)),
      "File type is not supported",
    )
    .refine((files) => files.length !== 0, "File is required"),
});

type CreateAttachmentsArgs = {
  entityId: string;
  entity: AttachmentEntity;
};

export const createAttachments = async (
  { entityId, entity }: CreateAttachmentsArgs,
  _actionState: ActionState,
  formData: FormData,
) => {
  const { user } = await getAuthOrRedirect();

  let subject;

  switch (entity) {
    case "TICKET": {
      subject = await prisma.ticket.findUnique({
        where: {
          id: entityId,
        },
      });
      break;
    }
    case "COMMENT": {
      subject = await prisma.comment.findUnique({
        where: {
          id: entityId,
        },
        include: {
          ticket: true,
        },
      });
      break;
    }
    default:
      return toActionState("ERROR", "Subject not found");
  }

  if (!subject) {
    return toActionState("ERROR", "Subject not found");
  }

  if (!isOwner(user, subject)) {
    return toActionState("ERROR", "Not the owner of this subject");
  }

  const attachments = [];
  const uploadedKeys: string[] = [];

  try {
    const { files } = createAttachmentsSchema.parse({
      files: formData.getAll("files"),
    });

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const attachment = await prisma.attachment.create({
        data: {
          name: file.name,
          ...(entity === "TICKET" ? { ticketId: entityId } : {}),
          ...(entity === "COMMENT" ? { commentId: entityId } : {}),
          entity,
        },
      });

      const organizationId = getOrganizationIdByAttachment(entity, subject);

      const key = generateS3Key({
        organizationId,
        entityId,
        entity,
        fileName: file.name,
        attachmentId: attachment.id,
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );

      attachments.push(attachment);
      uploadedKeys.push(key);
    }
  } catch (error) {
    // Rollback S3 uploads
    await Promise.all(
      uploadedKeys.map((key) =>
        s3
          .send(
            new DeleteObjectCommand({ Key: key } as DeleteObjectCommandInput),
          )
          .catch(() => null),
      ),
    );

    // Rollback DB entries
    await Promise.all(
      attachments.map((a) =>
        prisma.attachment.delete({
          where: {
            id: a.id,
          },
        }),
      ),
    );

    return fromErrorToActionState(error);
  }

  switch (entity) {
    case "TICKET":
      if (isTicket(subject)) {
        revalidatePath(ticketPath(subject.id));
      }
      break;
    case "COMMENT": {
      if (isComment(subject)) {
        revalidatePath(ticketPath(subject.ticket.id));
      }
      break;
    }
  }

  return toActionState("SUCCESS", "Attachment(s) uploaded");
};
