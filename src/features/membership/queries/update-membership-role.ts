"use server";

import { type MembershipRole } from "@prisma/client";
import { toActionState } from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";
import { getMemberships } from "./get-memberships";

export const updateMembershipRole = async ({
  userId,
  organizationId,
  newRole,
}: {
  userId: string;
  organizationId: string;
  newRole: MembershipRole;
}) => {
  const { user } = await getAuthOrRedirect();

  const memberships = await getMemberships(organizationId);

  // Check if current user is an admin

  const myMembership = memberships.find(
    (membership) => membership.userId === user.id,
  );

  if (!myMembership || myMembership.membershipRole !== "ADMIN") {
    return toActionState(
      "ERROR",
      "You must be an admin to change member roles",
    );
  }

  // Check if target membership exists

  const targetMembership = memberships.find(
    (membership) => membership.userId === userId,
  );

  if (!targetMembership) {
    return toActionState("ERROR", "Membership not found");
  }

  // Prevent demoting the last admin

  const adminMemberships = memberships.filter(
    (membership) => membership.membershipRole === "ADMIN",
  );

  const isDemotingAdmin =
    targetMembership.membershipRole === "ADMIN" && newRole === "MEMBER";
  const isLastAdmin = adminMemberships.length <= 1;

  if (isDemotingAdmin && isLastAdmin) {
    return toActionState(
      "ERROR",
      "You cannot demote the last admin of an organization",
    );
  }

  // Check if the role is already set to the target role

  if (targetMembership.membershipRole === newRole) {
    return toActionState("ERROR", `User is already a ${newRole.toLowerCase()}`);
  }

  // Update the membership role

  await prisma.membership.update({
    where: {
      membershipId: {
        userId,
        organizationId,
      },
    },
    data: {
      membershipRole: newRole,
    },
  });

  const roleLabel = newRole === "ADMIN" ? "admin" : "member";
  return toActionState("SUCCESS", `Successfully updated role to ${roleLabel}`);
};
