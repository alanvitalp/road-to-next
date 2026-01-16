"use server";

import { redirect } from "next/navigation";
import { setCookieByKey } from "@/actions/cookies";
import {
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { signInPath, ticketsByOrganizationPath } from "@/path";
import { hashToken } from "@/utils/crypto";

export const acceptInvitation = async (tokenId: string) => {
  try {
    const tokenHash = hashToken(tokenId);

    const invitation = await prisma.invitation.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!invitation) {
      return toActionState("ERROR", "Revoked or invalid verification token");
    }

    const user = await prisma.user.findUnique({
      where: {
        email: invitation.email,
      },
    });

    const memberRole = await prisma.role.findFirst({
      where: {
        organizationId: invitation.organizationId,
        name: "Member",
      },
    });

    if (!memberRole) {
      return toActionState("ERROR", "Member role not found");
    }

    if (user) {
      await prisma.$transaction([
        prisma.invitation.delete({
          where: {
            tokenHash,
          },
        }),

        prisma.membership.create({
          data: {
            organizationId: invitation.organizationId,
            userId: user.id,
            isActive: false,
            roleId: memberRole.id,
          },
        }),
      ]);
    } else {
      await prisma.invitation.update({
        where: {
          tokenHash,
        },
        data: {
          status: "ACCEPTED_WITHOUT_ACCOUNT",
        },
      });
    }

    const userHasSession = await prisma.session.findFirst({
      where: {
        userId: user?.id,
      },
    });

    if (userHasSession) {
      await setCookieByKey("toast", "Invitation accepted");
      redirect(ticketsByOrganizationPath());
    } else {
      await setCookieByKey("toast", "Invitation accepted");
      redirect(signInPath());
    }
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
