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

const createRoleSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "Role name is required" })
    .min(1, { message: "Role name must be at least 1 character long" })
    .max(191, { message: "Role name cannot exceed 191 characters" }),
  description: z.string().optional(),
  permissions: z.string().nonempty({ message: "At least one permission is required" }),
});

export const createRole = async (
  organizationId: string,
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const auth = await getAdminOrRedirect(organizationId);

    const canManage = await hasPermission(
      auth.user.id,
      organizationId,
      PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
    );

    if (!canManage) {
      return toActionState("ERROR", "Not authorized to create roles", formData);
    }

    const data = createRoleSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      permissions: formData.get("permissions"),
    });

    const permissions = data.permissions.split(",") as PermissionKey[];

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: data.name,
        },
      },
    });

    if (existingRole) {
      return toActionState("ERROR", "A role with this name already exists", formData);
    }

    await prisma.role.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description || null,
        permissions: {
          create: permissions.map((key) => ({
            key,
            value: true,
          })),
        },
      },
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  revalidatePath(rolesPath(organizationId));
  redirect(rolesPath(organizationId));
};
