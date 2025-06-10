"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"
import { setCookieByKey } from "@/actions/cookies"
import { ActionState, fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state"
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect"
import { isOwner } from "@/features/auth/utils/is-owner"
import { prisma } from "@/lib/prisma"
import { ticketPath, ticketsPath } from "@/path"
import { toCent } from "@/utils/currency"

const upsertTicketSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "Title is required" })
    .min(1, { message: "Title must be at least 1 characters long" })
    .max(191, { message: "Title cannot exceed 191 characters" }),
  content: z
    .string()
    .nonempty({ message: "Content is required" })
    .min(1, { message: "Content must be at least 1 characters long" })
    .max(1024, { message: "Content cannot exceed 1024 characters" }),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Is required"),
  bounty: z.coerce.number().positive(),
});

export const upsertTicket = async (id: string | undefined, _actionState: ActionState, formData: FormData) => {
  const { user } = await getAuthOrRedirect();

  try {
    if (id) {
      const ticket = await prisma.ticket.findUnique({
        where: {
          id,
        },
      });

      if (!ticket || !isOwner(user, ticket)) {
        return toActionState("ERROR", "Not authorized");
      }
    }

    const data = upsertTicketSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      deadline: formData.get("deadline"),
      bounty: formData.get("bounty")
    })
    
    const dbData = {
      ...data,
      userId: user.id,
      bounty: toCent(data.bounty) 
    };

    await prisma.ticket.upsert({
      where: {
        id: id || ""
      },
      update: dbData,
      create: dbData,
    })
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  revalidatePath(ticketsPath())
  
  if (id) {
    await setCookieByKey("toast", "Ticket updated");
    redirect(ticketPath(id))
  }

  return toActionState("SUCCESS", "Ticket created!")
}