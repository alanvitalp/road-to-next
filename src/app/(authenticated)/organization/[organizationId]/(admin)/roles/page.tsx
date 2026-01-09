import { LucidePlus, LucideShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleDeleteButton } from "@/features/permission/components/role-delete-button";
import { getOrganizationRoles } from "@/features/permission/queries/manage-permissions";

type RolesPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const RolesPage = async ({ params }: RolesPageProps) => {
  const { organizationId } = await params;

  return (
    <div className="flex flex-col flex-1 gap-y-8">
      <Heading
        title="Roles"
        description="Manage roles and permissions for your organization"
      />

      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/organization/${organizationId}/roles/create`}>
            <LucidePlus className="w-4 h-4 mr-2" />
            Create Role
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Spinner />}>
        <RolesList organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

type RolesListProps = {
  organizationId: string;
};

const RolesList = async ({ organizationId }: RolesListProps) => {
  const roles = await getOrganizationRoles(organizationId);

  if (!roles.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-y-4 p-8 border rounded-lg">
        <LucideShieldCheck className="w-12 h-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No roles created yet. Create your first role to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {role.description || "—"}
            </TableCell>
            <TableCell>{role._count.memberships}</TableCell>
            <TableCell>{role.permissions.length}</TableCell>
            <TableCell className="flex justify-end gap-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/organization/${organizationId}/roles/${role.id}`}>
                  Edit
                </Link>
              </Button>
              <RoleDeleteButton roleId={role.id} roleName={role.name} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RolesPage;
