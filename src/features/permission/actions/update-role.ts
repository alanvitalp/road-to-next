"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { prisma } from "@/lib/prisma";
import { rolesPath } from "@/path";
import { type PermissionKey,PERMISSIONS } from "../constants";
import { hasPermission } from "../utils/has-permission";

const updateRoleSchema = z.object({
  permissions: z.string().nonempty({ message: "At least one permission is required" }),
});

export const updateRole = async (
  roleId: string,
  organizationId: string,
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { organizationId: true },
    });

    if (!role) {
      return toActionState("ERROR", "Role not found", formData);
    }

    if (role.organizationId !== organizationId) {
      return toActionState("ERROR", "Not authorized", formData);
    }

    const auth = await getAdminOrRedirect(role.organizationId);

    const canManage = await hasPermission(
      auth.user.id,
      role.organizationId,
      PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
    );

    if (!canManage) {
      return toActionState("ERROR", "Not authorized to update roles", formData);
    }

    const data = updateRoleSchema.parse({
      permissions: formData.get("permissions"),
    });

    const permissions = data.permissions.split(",") as PermissionKey[];

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId },
      }),
      prisma.rolePermission.createMany({
        data: permissions.map((key) => ({
          roleId,
          key,
          value: true,
        })),
      }),
    ]);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  revalidatePath(rolesPath(organizationId));
  redirect(rolesPath(organizationId));
};
