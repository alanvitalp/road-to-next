"use server";

import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

export const getOrganization = async (organizationId: string) => {
  const { user } = await getAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      memberships: {
        where: {
          userId: user.id,
        },
        include: {
          role: true,
        },
      },
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Verify user is a member
  if (!organization.memberships.length) {
    throw new Error("Not a member of this organization");
  }

  return {
    ...organization,
    membershipByUser: organization.memberships[0],
  };
};
