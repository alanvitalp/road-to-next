import { revalidatePath } from "next/cache";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { membershipsPath } from "@/path";
import type { PermissionKey } from "../constants";

/**
 * Set a direct permission for a user in an organization
 */
export const setUserPermission = async (
  userId: string,
  organizationId: string,
  permissionKey: PermissionKey,
  value: boolean,
) => {
  const permission = await prisma.permission.upsert({
    where: {
      userId_organizationId_key: {
        userId,
        organizationId,
        key: permissionKey,
      },
    },
    update: {
      value,
      updatedAt: new Date(),
    },
    create: {
      userId,
      organizationId,
      key: permissionKey,
      value,
    },
  });

  revalidatePath(membershipsPath(organizationId));

  return permission;
};

/**
 * Remove a direct permission for a user
 */
export const removeUserPermission = async (
  userId: string,
  organizationId: string,
  permissionKey: PermissionKey,
) => {
  await prisma.permission.delete({
    where: {
      userId_organizationId_key: {
        userId,
        organizationId,
        key: permissionKey,
      },
    },
  });

  revalidatePath(membershipsPath(organizationId));
};

/**
 * Set multiple permissions for a user at once
 */
export const setUserPermissions = async (
  userId: string,
  organizationId: string,
  permissions: Record<PermissionKey, boolean>,
) => {
  const operations = Object.entries(permissions).map(([key, value]) =>
    prisma.permission.upsert({
      where: {
        userId_organizationId_key: {
          userId,
          organizationId,
          key: key as PermissionKey,
        },
      },
      update: {
        value,
        updatedAt: new Date(),
      },
      create: {
        userId,
        organizationId,
        key: key as PermissionKey,
        value,
      },
    }),
  );

  await prisma.$transaction(operations);

  revalidatePath(membershipsPath(organizationId));
};

/**
 * Get all permissions for a user in an organization
 */
export const getUserPermissionsData = async (
  userId: string,
  organizationId: string,
) => {
  const permissions = await prisma.permission.findMany({
    where: {
      userId,
      organizationId,
    },
    orderBy: {
      key: "asc",
    },
  });

  return permissions;
};

/**
 * Create a new role in an organization
 */
export const createRole = async (
  organizationId: string,
  name: string,
  description: string | null,
  permissions: Record<PermissionKey, boolean>,
) => {
  const role = await prisma.role.create({
    data: {
      organizationId,
      name,
      description,
      permissions: {
        create: Object.entries(permissions).map(([key, value]) => ({
          key: key as PermissionKey,
          value,
        })),
      },
    },
    include: {
      permissions: true,
    },
  });

  revalidatePath(membershipsPath(organizationId));

  return role;
};

/**
 * Update a role's permissions
 */
export const updateRolePermissions = async (
  roleId: string,
  permissions: Record<PermissionKey, boolean>,
) => {
  // Get the role to find organizationId for revalidation
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { organizationId: true },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // Delete existing permissions and create new ones
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({
      where: { roleId },
    }),
    prisma.rolePermission.createMany({
      data: Object.entries(permissions).map(([key, value]) => ({
        roleId,
        key: key as PermissionKey,
        value,
      })),
    }),
  ]);

  revalidatePath(membershipsPath(role.organizationId));
};

/**
 * Assign a role to a user
 */
export const assignRoleToUser = async (
  userId: string,
  organizationId: string,
  roleId: string | null,
) => {
  const membership = await prisma.membership.update({
    where: {
      membershipId: {
        userId,
        organizationId,
      },
    },
    data: {
      roleId,
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  revalidatePath(membershipsPath(organizationId));

  return membership;
};

/**
 * Get all roles in an organization
 * SECURITY: Verifies user is a member of the organization
 */
export const getOrganizationRoles = async (organizationId: string) => {
  const auth = await getAuth();

  if (!auth.user) {
    throw new Error("Unauthorized");
  }

  // Verify user is a member of the organization
  const membership = await prisma.membership.findUnique({
    where: {
      membershipId: {
        userId: auth.user.id,
        organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  const roles = await prisma.role.findMany({
    where: {
      organizationId,
    },
    include: {
      permissions: true,
      _count: {
        select: {
          memberships: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return roles;
};

/**
 * Get a specific role with its permissions
 * SECURITY: Verifies user is a member of the organization that owns the role
 */
export const getRole = async (roleId: string) => {
  const auth = await getAuth();

  if (!auth.user) {
    throw new Error("Unauthorized");
  }

  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    include: {
      permissions: true,
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  // Verify user is a member of the organization that owns this role
  const membership = await prisma.membership.findUnique({
    where: {
      membershipId: {
        userId: auth.user.id,
        organizationId: role.organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  return role;
};

/**
 * Delete a role (will set roleId to null for all members)
 */
export const deleteRole = async (roleId: string) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { organizationId: true },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });

  revalidatePath(membershipsPath(role.organizationId));
};
