import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { PermissionList } from "@/features/permission/components/permission-list";
import { RoleAssignmentSelect } from "@/features/permission/components/role-assignment-select";
import { PERMISSIONS } from "@/features/permission/constants";
import { getOrganizationRoles } from "@/features/permission/queries/manage-permissions";
import {
  getUserPermissions,
  hasPermission,
} from "@/features/permission/utils/has-permission";
import { prisma } from "@/lib/prisma";
import { membershipsPath } from "@/path";

type MemberPermissionsPageProps = {
  params: Promise<{
    organizationId: string;
    userId: string;
  }>;
};

const MemberPermissionsPage = async ({
  params,
}: MemberPermissionsPageProps) => {
  const { organizationId, userId } = await params;
  const auth = await getAuthOrRedirect();

  // Get membership to verify it exists
  const membership = await prisma.membership.findUnique({
    where: {
      membershipId: {
        userId,
        organizationId,
      },
    },
    include: {
      user: {
        select: {
          username: true,
          email: true,
        },
      },
      role: true,
    },
  });

  if (!membership) {
    notFound();
  }

  // Check if current user can manage permissions
  const canManagePermissions = await hasPermission(
    auth.user.id,
    organizationId,
    PERMISSIONS.MEMBER_UPDATE_PERMISSIONS,
  );

  // Check if user has all permissions (admin-like)
  const userPermissions = await getUserPermissions(userId, organizationId);
  const isAdmin = userPermissions.length === Object.keys(PERMISSIONS).length;

  return (
    <div className="flex flex-col flex-1 gap-y-8">
      <div className="flex items-center gap-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={membershipsPath(organizationId)}>
            <LucideArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <Heading
          title={`Permissions: ${membership.user.username}`}
          description={`Manage permissions and role for ${membership.user.email}`}
        />
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Role Assignment */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Role Assignment</h3>
              <p className="text-sm text-muted-foreground">
                Assign a role to automatically grant a set of permissions
              </p>
            </div>
            <Suspense fallback={<Spinner />}>
              <RoleAssignment
                userId={userId}
                organizationId={organizationId}
                currentRoleId={membership.roleId}
                isAdmin={isAdmin}
                canManage={canManagePermissions}
              />
            </Suspense>
          </div>
        </Card>

        {/* Direct Permissions */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Direct Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Override role permissions with specific user permissions
              </p>
            </div>
            <Suspense fallback={<Spinner />}>
              <PermissionList
                userId={userId}
                organizationId={organizationId}
                canManagePermissions={canManagePermissions}
              />
            </Suspense>
          </div>
        </Card>
      </div>
    </div>
  );
};

type RoleAssignmentProps = {
  userId: string;
  organizationId: string;
  currentRoleId: string | null;
  isAdmin: boolean;
  canManage: boolean;
};

const RoleAssignment = async ({
  userId,
  organizationId,
  currentRoleId,
  canManage,
}: RoleAssignmentProps) => {
  const roles = await getOrganizationRoles(organizationId);

  return (
    <RoleAssignmentSelect
      userId={userId}
      organizationId={organizationId}
      currentRoleId={currentRoleId}
      roles={roles}
      disabled={!canManage}
    />
  );
};

export default MemberPermissionsPage;
