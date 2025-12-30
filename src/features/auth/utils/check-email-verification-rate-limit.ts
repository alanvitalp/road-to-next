import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_RATE_LIMIT_MS = 1000 * 60; // 1 minute

export const checkEmailVerificationRateLimit = async (
  userId: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> => {
  const lastToken = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!lastToken) {
    return { allowed: true };
  }

  const timeSinceLastEmail = Date.now() - lastToken.createdAt.getTime();

  if (timeSinceLastEmail < EMAIL_VERIFICATION_RATE_LIMIT_MS) {
    const retryAfterSeconds = Math.ceil(
      (EMAIL_VERIFICATION_RATE_LIMIT_MS - timeSinceLastEmail) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
};

