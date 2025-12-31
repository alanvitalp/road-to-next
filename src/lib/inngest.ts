import { EventSchemas, Inngest } from "inngest";
import { EmailVerificationEventArgs } from "@/features/auth/events/email-verification-event";
import { PasswordResetEventArgs } from "@/features/password/events/event-password-reset";

type Events = {
    "app/password.password-reset": PasswordResetEventArgs;
    "app/auth.sign-up": EmailVerificationEventArgs;
};

export const inngest = new Inngest({
    id: "alan-road-to-next",
    schemas: new EventSchemas().fromRecord<Events>(),
});