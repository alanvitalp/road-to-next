import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { EditRoleForm } from "@/features/permission/components/edit-role-form";
import { getRole } from "@/features/permission/queries/manage-permissions";
import { rolesPath } from "@/path";

type EditRolePageProps = {
  params: Promise<{
    organizationId: string;
    roleId: string;
  }>;
};

const EditRolePage = async ({ params }: EditRolePageProps) => {
  const { organizationId, roleId } = await params;

  const role = await getRole(roleId);

  if (!role || role.organizationId !== organizationId) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 gap-y-8">
      <div className="flex items-center gap-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={rolesPath(organizationId)}>
            <LucideArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <Heading
          title={`Edit Role: ${role.name}`}
          description="Update role permissions and details"
        />
      </div>

      <div className="max-w-2xl">
        <EditRoleForm
          organizationId={organizationId}
          role={role}
        />
      </div>
    </div>
  );
};

export default EditRolePage;
