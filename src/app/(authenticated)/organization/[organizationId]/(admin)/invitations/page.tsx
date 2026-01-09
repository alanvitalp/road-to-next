import { Suspense } from "react";
import { Heading } from "@/components/heading";
import { NavigationTabs } from "@/components/navigation-tabs";
import { Spinner } from "@/components/spinner";
import { InvitationList } from "@/features/invitations/components/invitations-list";
import { getOrganization } from "@/features/organization/queries/get-organization";
import { invitationsPath, membershipsPath } from "@/path";
import { OrganizationBreadcrumbs } from "../_navigation/tabs";

type InvitationsPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const InvitationsPage = async ({ params }: InvitationsPageProps) => {
  const { organizationId } = await params;
  const organization = await getOrganization(organizationId);

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading
        title="Invitations"
        description="Manage your organization's invitations"
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
      />

      <Suspense fallback={<Spinner />}>
        <InvitationList organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

export default InvitationsPage;
