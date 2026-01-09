import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { getActiveOrganization } from "@/features/organization/queries/get-active-organization";
import { prisma } from "@/lib/prisma";
import type { ParsedSearchParams } from "../search-params";
import { getActiveMembership } from "@/features/membership/queries/get-active-membership";
import { getTicketPermissions } from "../permissions/queries/get-ticket-permissions";

export const getTickets = async (
  userId: string | undefined,
  byOrganization: boolean,
  searchParams: ParsedSearchParams,
) => {
  const { user } = await getAuth();
  const activeOrganization = await getActiveOrganization();

  const where = {
    userId,
    title: {
      contains: searchParams.search,
      mode: "insensitive" as const,
    },
    ...(byOrganization && activeOrganization
      ? {
          organizationId: activeOrganization.id,
        }
      : {}),
  };

  const skip = searchParams.size * searchParams.page;
  const take = searchParams.size;

  const [tickets, count, totalCount] = await prisma.$transaction([
    prisma.ticket.findMany({
      where,
      skip,
      take,
      orderBy: {
        [searchParams.sortKey]: searchParams.sortValue,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    }),
    prisma.ticket.count({
      where,
    }),
    prisma.ticket.count({
      where: { userId },
    }),
  ]);

  const permissions = await getTicketPermissions({
    organizationId: activeOrganization?.id,
    userId: user?.id,
  });

  return {
    list: tickets.map((ticket) => ({
      ...ticket,
      isOwner: isOwner(user, ticket),
      permissions: {
        canDeleteTicket: isOwner(user, ticket) && permissions.canDeleteTicket,
      },
    })),
    metadata: {
      count,
      totalCount,
      hasNextPage: count > skip + take,
    },
  };
};
