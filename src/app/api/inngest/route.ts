import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { passwordResetFunction } from "@/features/password/events/event-password-reset";
import { emailVerificationEvent } from "@/features/auth/events/email-verification-event";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [passwordResetFunction, emailVerificationEvent],
});