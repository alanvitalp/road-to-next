import { LucideShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Heading } from "@/components/heading";
import { NavigationTabs } from "@/components/navigation-tabs";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { InvitationCreateButton } from "@/features/invitations/components/invitation-create-button";
import { MembershipList } from "@/features/membership/components/membership-list";
import { getOrganization } from "@/features/organization/queries/get-organization";
import { invitationsPath, membershipsPath, rolesPath } from "@/path";
import { OrganizationBreadcrumbs } from "../_navigation/tabs";

type MembershipsPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const MembershipsPage = async ({ params }: MembershipsPageProps) => {
  const { organizationId } = await params;
  const organization = await getOrganization(organizationId);

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading
        title="Memberships"
        description="Manage members in your organization"
        breadcrumbs={
          <OrganizationBreadcrumbs organizationName={organization.name} />
        }
        tabs={
          <NavigationTabs
            tabs={[
              {
                title: "Memberships",
                href: membershipsPath(organizationId),
                match: "memberships",
              },
              {
                title: "Invitations",
                href: invitationsPath(organizationId),
                match: "invitations",
              },
            ]}
          />
        }
        actions={
          <>
            <InvitationCreateButton organizationId={organizationId} />
            <Button asChild>
              <Link href={rolesPath(organizationId)}>
                <LucideShieldCheck className="w-4 h-4 mr-2" />
                Manage Roles
              </Link>
            </Button>
          </>
        }
      />

      <Suspense fallback={<Spinner />}>
        <MembershipList organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

export default MembershipsPage;
