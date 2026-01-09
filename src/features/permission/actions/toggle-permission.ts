"use server";

import { revalidatePath } from "next/cache";
import {
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";
import { membershipsPath } from "@/path";
import { type PermissionKey, PERMISSIONS } from "../constants";
import { hasPermission } from "../utils/has-permission";

export const toggleUserPermission = async ({
  userId,
  organizationId,
  permissionKey,
}: {
  userId: string;
  organizationId: string;
  permissionKey: PermissionKey;
}) => {
  try {
    const auth = await getAdminOrRedirect(organizationId);

    const canManage = await hasPermission(
      auth.user.id,
      organizationId,
      PERMISSIONS.MEMBER_UPDATE_PERMISSIONS,
    );

    if (!canManage) {
      return toActionState("ERROR", "Not authorized to manage permissions");
    }

    // Get current permission value
    const currentPermission = await prisma.permission.findUnique({
      where: {
        userId_organizationId_key: {
          userId,
          organizationId,
          key: permissionKey,
        },
      },
    });

    const newValue = currentPermission ? !currentPermission.value : true;

    await prisma.permission.upsert({
      where: {
        userId_organizationId_key: {
          userId,
          organizationId,
          key: permissionKey,
        },
      },
      update: {
        value: newValue,
        updatedAt: new Date(),
      },
      create: {
        userId,
        organizationId,
        key: permissionKey,
        value: newValue,
      },
    });

    revalidatePath(membershipsPath(organizationId));

    return toActionState("SUCCESS", "Permission updated");
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
