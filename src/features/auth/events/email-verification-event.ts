import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { sendEmailVerification } from "../emails/send-email-verification";
import { checkEmailVerificationRateLimit } from "../utils/check-email-verification-rate-limit";
import { generateEmailVerificationCode } from "../utils/generate-email-verification-code";

export type EmailVerificationEventArgs = {
  data: {
    userId: string;
  };
};

export const emailVerificationEvent = inngest.createFunction(
  { id: "email-verification" },
  { event: "app/auth.sign-up" },
  async ({ event }) => {
    const { userId } = event.data;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const rateLimit = await checkEmailVerificationRateLimit(user.id);

    if (!rateLimit.allowed) {
      // Silently skip sending if rate limited (user just signed up, so this is unlikely)
      // But we still want to prevent abuse
      return {
        event,
        body: { skipped: true, reason: "rate_limited" },
      };
    }

    const verificationCode = await generateEmailVerificationCode(
      user.id,
      user.email
    );

    const result = await sendEmailVerification(
      user.username,
      user.email,
      verificationCode
    );

    if (result.error) {
      throw new Error(`${result.error.name}: ${result.error.message}`);
    }

    return { event, body: result };
  }
);