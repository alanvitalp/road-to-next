import { serve } from "inngest/next";
import { emailVerificationEvent } from "@/features/auth/events/email-verification-event";
import { invitationCreatedEvent } from "@/features/invitations/events/event-invitation-create";
import { passwordResetFunction } from "@/features/password/events/event-password-reset";
import { inngest } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    passwordResetFunction,
    emailVerificationEvent,
    invitationCreatedEvent,
  ],
});
