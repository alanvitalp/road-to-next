import { EventSchemas, Inngest } from "inngest";
import type { EmailVerificationEventArgs } from "@/features/auth/events/email-verification-event";
import type { InvitationCreateEventArgs } from "@/features/invitations/events/event-invitation-create";
import type { PasswordResetEventArgs } from "@/features/password/events/event-password-reset";

type Events = {
  "app/password.password-reset": PasswordResetEventArgs;
  "app/auth.sign-up": EmailVerificationEventArgs;
  "app/invitation.created": InvitationCreateEventArgs;
};

export const inngest = new Inngest({
  id: "alan-road-to-next",
  schemas: new EventSchemas().fromRecord<Events>(),
});
