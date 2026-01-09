"use server";

import { toActionState } from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";
import { getMemberships } from "./get-memberships";

export const deleteMembership = async ({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) => {
  const { user } = await getAuthOrRedirect();

  const memberships = await getMemberships(organizationId);

  const isLastMembership = (memberships ?? []).length <= 1;

  if (isLastMembership) {
    return toActionState(
      "ERROR",
      "You cannot delete the last membership of an organization",
    );
  }

  // Check if membership exists

  const targetMembership = (memberships ?? []).find(
    (membership) => membership.userId === userId,
  );

  if (!targetMembership) {
    return toActionState("ERROR", "Membership not found");
  }

  // Check if user is deleting last admin

  const adminMemberships = (memberships ?? []).filter(
    (membership) => membership.role?.name === "Admin",
  );

  const removesAdmin = targetMembership.role?.name === "Admin";
  const isLastAdmin = adminMemberships.length <= 1;

  if (removesAdmin && isLastAdmin) {
    return toActionState(
      "ERROR",
      "You cannot delete the last admin of an organization",
    );
  }

  // Check if user is deleting last admin

  const myMembership = (memberships ?? []).find(
    (membership) => membership.userId === user?.id,
  );

  const isMyself = user.id === userId;
  const isAdmin = myMembership?.role?.name === "Admin";

  if (!isMyself && !isAdmin) {
    return toActionState(
      "ERROR",
      "You can only delete memberships as an admin",
    );
  }

  await prisma.membership.delete({
    where: {
      membershipId: {
        userId,
        organizationId,
      },
    },
  });

  return toActionState("SUCCESS", "The membership has been deleted");
};
