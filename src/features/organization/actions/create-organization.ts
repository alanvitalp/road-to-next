"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { setCookieByKey } from "@/actions/cookies";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/path";

const createOrganizationSchema = z.object({
  name: z.string().min(1).max(191),
});

export const createOrganization = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  const { user } = await getAuthOrRedirect({
    checkOrganization: false,
    checkActiveOrganization: false,
  });

  try {
    const data = createOrganizationSchema.parse({
      name: formData.get("name"),
    });

    // Deactivate all current memberships
    await prisma.membership.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isActive: false,
      },
    });

    // Create organization with membership
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        memberships: {
          create: {
            userId: user.id,
            isActive: true,
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    // Create Admin role for the new organization
    const adminRole = await prisma.role.create({
      data: {
        organizationId: organization.id,
        name: "Admin",
        description: "Full access to all features",
        permissions: {
          create: [
            { key: "ticket:create", value: true },
            { key: "ticket:read", value: true },
            { key: "ticket:update", value: true },
            { key: "ticket:delete", value: true },
            { key: "ticket:update_status", value: true },
            { key: "comment:create", value: true },
            { key: "comment:read", value: true },
            { key: "comment:update", value: true },
            { key: "comment:delete", value: true },
            { key: "organization:update", value: true },
            { key: "organization:delete", value: true },
            { key: "organization:manage_members", value: true },
            { key: "member:invite", value: true },
            { key: "member:remove", value: true },
            { key: "member:update_role", value: true },
            { key: "member:update_permissions", value: true },
          ],
        },
      },
    });

    // Create Member role
    await prisma.role.create({
      data: {
        organizationId: organization.id,
        name: "Member",
        description: "Basic member with read and create access",
        permissions: {
          create: [
            { key: "ticket:read", value: true },
            { key: "ticket:create", value: true },
            { key: "comment:read", value: true },
            { key: "comment:create", value: true },
          ],
        },
      },
    });

    // Assign Admin role to creator
    await prisma.membership.update({
      where: {
        membershipId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      data: {
        roleId: adminRole.id,
      },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }

  await setCookieByKey("toast", "Organization created");
  redirect(ticketsPath());
};
