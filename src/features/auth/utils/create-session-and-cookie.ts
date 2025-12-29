import { createSession } from "@/lib/oslo";
import { generateRandomToken } from "@/utils/crypto";
import { setSessionCookie } from "./session-cookie";

/**
 * Creates a new session for a user and sets the session cookie.
 * This is a reusable function for sign-in flows.
 */
export const createSessionAndCookie = async (userId: string) => {
  const sessionToken = generateRandomToken();
  const session = await createSession(sessionToken, userId);
  await setSessionCookie(sessionToken, session.expiresAt);
  return session;
};

