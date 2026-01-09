import { notFound, redirect } from "next/navigation";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { PERMISSIONS } from "@/features/permission/constants";
import { hasPermission } from "@/features/permission/utils/has-permission";
import { getMembership } from "./get-membership";

export const getAdminOrRedirect = async (organizationId: string) => {
  const auth = await getAuthOrRedirect();

  const membership = await getMembership({
    organizationId,
    userId: auth.user.id,
  });

  if (!membership) {
    redirect(notFound());
  }

  // Check if user has admin-level permissions
  const canManage = await hasPermission(
    auth.user.id,
    organizationId,
    PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
  );

  if (!canManage) {
    redirect(notFound());
  }

  return { ...auth, membership };
};
