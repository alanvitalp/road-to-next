
import EmailVerification from "@/emails/password/auth/email-verification";
import { resend } from "@/lib/resend";

export const sendEmailVerification = async (
  username: string,
  email: string,
  verificationCode: string
) => {
  return await resend.emails.send({
    // your own custom domain here
    // or your email that you used to sign up at Resend
    from: "no-reply@alanvital18@gmail.com",
    to: email,
    subject: "Email Verification from TicketBounty",
    react: <EmailVerification toName={username} code={verificationCode} />,
  });
};