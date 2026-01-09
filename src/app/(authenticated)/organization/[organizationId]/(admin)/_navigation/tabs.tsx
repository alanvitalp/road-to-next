import { Breadcrumbs } from "@/components/breadcrumbs";
import { organizationsPath } from "@/path";

type OrganizationBreadcrumbsProps = {
  organizationName: string;
};

const OrganizationBreadcrumbs = ({
  organizationName,
}: OrganizationBreadcrumbsProps) => {
  return (
    <Breadcrumbs
      breadcrumbs={[
        { title: "Organizations", href: organizationsPath() },
        {
          title: organizationName,
          href: undefined,
        },
      ]}
    />
  );
};

export { OrganizationBreadcrumbs };
