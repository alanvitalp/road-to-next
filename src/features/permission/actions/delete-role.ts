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

export const deleteRole = async (roleId: string) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { organizationId: true },
    });

    if (!role) {
      return toActionState("ERROR", "Role not found");
    }

    const auth = await getAdminOrRedirect(role.organizationId);

    const canManage = await hasPermission(
      auth.user.id,
      role.organizationId,
      PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
    );

    if (!canManage) {
      return toActionState("ERROR", "Not authorized to delete roles");
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    revalidatePath(membershipsPath(role.organizationId));

    return toActionState("SUCCESS", "Role deleted successfully");
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
