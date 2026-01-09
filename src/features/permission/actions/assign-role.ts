"use server";

import { revalidatePath } from "next/cache";
import {
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";
import { membershipsPath } from "@/path";
import { PERMISSIONS } from "../constants";
import { hasPermission } from "../utils/has-permission";

export const assignRole = async ({
  userId,
  organizationId,
  roleId,
}: {
  userId: string;
  organizationId: string;
  roleId: string | null;
}) => {
  try {
    const auth = await getAdminOrRedirect(organizationId);

    const canManage = await hasPermission(
      auth.user.id,
      organizationId,
      PERMISSIONS.MEMBER_UPDATE_ROLE,
    );

    if (!canManage) {
      return toActionState("ERROR", "Not authorized to manage roles");
    }

    // Verify role belongs to the same organization if roleId is provided
    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        select: { organizationId: true },
      });

      if (!role || role.organizationId !== organizationId) {
        return toActionState("ERROR", "Invalid role");
      }
    }

    await prisma.membership.update({
      where: {
        membershipId: {
          userId,
          organizationId,
        },
      },
      data: {
        roleId,
      },
    });

    revalidatePath(membershipsPath(organizationId));

    return toActionState(
      "SUCCESS",
      roleId ? "Role assigned successfully" : "Role removed successfully",
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
