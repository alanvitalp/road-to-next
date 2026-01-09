import { prisma } from "@/lib/prisma";
import type { PermissionKey } from "../constants";

/**
 * Check if a user has a specific permission in an organization
 * Checks both direct permissions and role-based permissions
 */
export const hasPermission = async (
  userId: string,
  organizationId: string,
  permissionKey: PermissionKey,
): Promise<boolean> => {
  const membership = await prisma.membership.findUnique({
    where: {
      membershipId: {
        userId,
        organizationId,
      },
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!membership) {
    return false;
  }

  // Check direct user permissions
  const directPermission = await prisma.permission.findUnique({
    where: {
      userId_organizationId_key: {
        userId,
        organizationId,
        key: permissionKey,
      },
    },
  });

  if (directPermission) {
    return directPermission.value;
  }

  // Check role-based permissions
  if (membership.role) {
    const rolePermission = membership.role.permissions.find(
      (p) => p.key === permissionKey,
    );

    if (rolePermission) {
      return rolePermission.value;
    }
  }

  // Default deny
  return false;
};

/**
 * Check multiple permissions at once
 * Returns a map of permission keys to boolean values
 */
export const hasPermissions = async (
  userId: string,
  organizationId: string,
  permissionKeys: PermissionKey[],
): Promise<Record<PermissionKey, boolean>> => {
  const results = await Promise.all(
    permissionKeys.map(async (key) => ({
      key,
      value: await hasPermission(userId, organizationId, key),
    })),
  );

  return results.reduce(
    (acc, { key, value }) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<PermissionKey, boolean>,
  );
};

/**
 * Get all permissions for a user in an organization
 * Returns a flat list of permission keys the user has
 */
export const getUserPermissions = async (
  userId: string,
  organizationId: string,
): Promise<PermissionKey[]> => {
  const membership = await prisma.membership.findUnique({
    where: {
      membershipId: {
        userId,
        organizationId,
      },
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!membership) {
    return [];
  }

  const permissions = new Set<PermissionKey>();

  // Get direct permissions
  const directPermissions = await prisma.permission.findMany({
    where: {
      userId,
      organizationId,
      value: true,
    },
  });

  directPermissions.forEach((p) => {
    permissions.add(p.key as PermissionKey);
  });

  // Get role permissions
  if (membership.role) {
    membership.role.permissions
      .filter((p) => p.value)
      .forEach((p) => {
        permissions.add(p.key as PermissionKey);
      });
  }

  return Array.from(permissions);
};

/**
 * Check if user has ANY of the provided permissions
 */
export const hasAnyPermission = async (
  userId: string,
  organizationId: string,
  permissionKeys: PermissionKey[],
): Promise<boolean> => {
  for (const key of permissionKeys) {
    if (await hasPermission(userId, organizationId, key)) {
      return true;
    }
  }
  return false;
};

/**
 * Check if user has ALL of the provided permissions
 */
export const hasAllPermissions = async (
  userId: string,
  organizationId: string,
  permissionKeys: PermissionKey[],
): Promise<boolean> => {
  for (const key of permissionKeys) {
    if (!(await hasPermission(userId, organizationId, key))) {
      return false;
    }
  }
  return true;
};
