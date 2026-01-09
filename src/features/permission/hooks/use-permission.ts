"use client";

import { useQuery } from "@tanstack/react-query";
import type { PermissionKey } from "../constants";

type UsePermissionOptions = {
  userId: string;
  organizationId: string;
  permissionKey: PermissionKey;
};

type UsePermissionsOptions = {
  userId: string;
  organizationId: string;
  permissionKeys: PermissionKey[];
};

/**
 * Client-side hook to check a single permission
 */
export const usePermission = ({
  userId,
  organizationId,
  permissionKey,
}: UsePermissionOptions) => {
  return useQuery({
    queryKey: ["permission", userId, organizationId, permissionKey],
    queryFn: async () => {
      const response = await fetch(
        `/api/permissions/check?userId=${userId}&organizationId=${organizationId}&permissionKey=${permissionKey}`,
      );

      if (!response.ok) {
        throw new Error("Failed to check permission");
      }

      const data = await response.json();
      return data.hasPermission as boolean;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Client-side hook to check multiple permissions
 */
export const usePermissions = ({
  userId,
  organizationId,
  permissionKeys,
}: UsePermissionsOptions) => {
  return useQuery({
    queryKey: ["permissions", userId, organizationId, permissionKeys],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId,
        organizationId,
        permissionKeys: permissionKeys.join(","),
      });

      const response = await fetch(`/api/permissions/check-multiple?${params}`);

      if (!response.ok) {
        throw new Error("Failed to check permissions");
      }

      const data = await response.json();
      return data.permissions as Record<PermissionKey, boolean>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Client-side hook to get all user permissions
 */
export const useUserPermissions = (userId: string, organizationId: string) => {
  return useQuery({
    queryKey: ["user-permissions", userId, organizationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/permissions/user?userId=${userId}&organizationId=${organizationId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user permissions");
      }

      const data = await response.json();
      return data.permissions as PermissionKey[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
