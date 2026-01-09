import { LucideShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { MembershipList } from "@/features/membership/components/membership-list";
import { rolesPath } from "@/path";

type MembershipsPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const MembershipsPage = async ({ params }: MembershipsPageProps) => {
  const { organizationId } = await params;

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading
        title="Memberships"
        description="Manage members in your organization"
        actions={
          <Button asChild>
            <Link href={rolesPath(organizationId)}>
              <LucideShieldCheck className="w-4 h-4 mr-2" />
              Manage Roles
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<Spinner />}>
        <MembershipList organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

export default MembershipsPage;
