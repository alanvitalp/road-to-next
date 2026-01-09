import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import type { TicketWithMetadata } from "../types";
import { getActiveMembership } from "@/features/membership/queries/get-active-membership";
import { getTicketPermissions } from "../permissions/queries/get-ticket-permissions";

export const getTicket = async (
  id: string,
): Promise<TicketWithMetadata | null> => {
  const { user } = await getAuth();

  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  const permissions = await getTicketPermissions({
    organizationId: ticket.organizationId,
    userId: user?.id,
  });

  return {
    ...ticket,
    isOwner: isOwner(user, ticket),
    permissions: {
      canDeleteTicket: isOwner(user, ticket) && !!permissions.canDeleteTicket,
    },
  };
};
