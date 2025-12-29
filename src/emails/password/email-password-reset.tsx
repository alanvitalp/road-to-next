import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type EmailPasswordResetProps = {
  toName: string;
  url: string;
};

const EmailPasswordReset = ({ toName, url }: EmailPasswordResetProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-lg">
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Header */}
              <Section className="mb-6">
                <Text className="text-2xl font-bold text-gray-900 m-0 mb-2">
                  TicketBounty
                </Text>
                <Text className="text-sm text-gray-500 m-0">
                  Password Reset Request
                </Text>
              </Section>

              <Hr className="border-gray-200 my-6" />

              {/* Main Content */}
              <Section className="mb-6">
                <Text className="text-base text-gray-700 leading-relaxed m-0 mb-4">
                  Hello <strong>{toName}</strong>,
                </Text>
                <Text className="text-base text-gray-700 leading-relaxed m-0 mb-6">
                  You have requested to reset your password. Click the button
                  below to create a new password. This link will expire in 2
                  hours.
                </Text>
              </Section>

              {/* Button */}
              <Section className="mb-6 text-center">
                <Button
                  href={url}
                  className="bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg no-underline inline-block"
                >
                  Reset Password
                </Button>
              </Section>

              {/* Alternative Link */}
              <Section className="mb-6">
                <Text className="text-sm text-gray-500 m-0 mb-2">
                  Or copy and paste this link into your browser:
                </Text>
                <Text className="text-sm text-blue-600 break-all m-0">
                  {url}
                </Text>
              </Section>

              <Hr className="border-gray-200 my-6" />

              {/* Footer */}
              <Section>
                <Text className="text-xs text-gray-500 m-0 mb-2">
                  If you didn't request this password reset, you can safely
                  ignore this email.
                </Text>
                <Text className="text-xs text-gray-400 m-0">
                  This is an automated message, please do not reply to this
                  email.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EmailPasswordReset.PreviewProps = {
  toName: "Alan Vital",
  url: "http://localhost:3000/password-reset/abc123",
} as EmailPasswordResetProps;

export default EmailPasswordReset;