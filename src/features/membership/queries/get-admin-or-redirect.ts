import { notFound, redirect } from "next/navigation";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
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

  if (membership.membershipRole !== "ADMIN") {
    redirect(notFound());
  }

  return { ...auth, membership };
};
