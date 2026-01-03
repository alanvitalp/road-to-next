import { redirect } from "next/navigation";
import {
  emailVerificationPath,
  onboardingPath,
  selectActiveOrganizationPath,
  signInPath,
} from "@/path";
import { getAuth } from "./get-auth";
import { getOrganizationsByUser } from "@/features/organization/queries/get-organization-by-users";

type GetAuthOrRedirectOptions = {
  checkEmailVerified?: boolean;
  checkOrganization?: boolean;
  checkActiveOrganization?: boolean;
};

export const getAuthOrRedirect = async (options?: GetAuthOrRedirectOptions) => {
  const {
    checkEmailVerified = true,
    checkOrganization = true,
    checkActiveOrganization = true,
  } = options ?? {};
  const auth = await getAuth();

  if (!auth.user) {
    redirect(signInPath());
  }

  if (checkEmailVerified && !auth.user.emailVerified) {
    redirect(emailVerificationPath());
  }

  if (checkOrganization || checkActiveOrganization) {
    const organizations = await getOrganizationsByUser();

    if (checkOrganization && !organizations.length) {
      redirect(onboardingPath());
    }

    const hasActive = organizations.some((organization) => {
      return organization.membershipByUser.isActive;
    });

    if (checkActiveOrganization && !hasActive) {
      redirect(selectActiveOrganizationPath());
    }
  }

  return auth;
};
