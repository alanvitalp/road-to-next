export const homePath = () => "/";

export const ticketsPath = () => "/tickets";
export const ticketPath = (ticketId: string) => `/tickets/${ticketId}`;
export const editTicketPath = (ticketId: string) => `/tickets/${ticketId}/edit`;

export const signUpPath = () => "/sign-up";
export const signInPath = () => "/sign-in";
export const passwordForgotPath = () => "/password-forgot";
export const passwordResetPath = () => "/password-reset";

export const membershipsPath = (organizationId: string) =>
  `/organization/${organizationId}/memberships`;

export const accountProfilePath = () => "/account/profile";
export const accountPasswordPath = () => "/account/password";

export const emailVerificationPath = () => "/email-verification";

export const organizationsPath = () => "/organization";
export const selectActiveOrganizationPath = () =>
  "/onboarding/select-active-organization";
export const organizationCreatePath = () => "/organization/create";

export const onboardingPath = () => "/onboarding";
