import { format } from "date-fns";
import { LucideBan, LucideCheck, LucideShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { PERMISSIONS } from "@/features/permission/constants";
import { hasPermission } from "@/features/permission/utils/has-permission";
import { memberPermissionsPath } from "@/path";
import { getMemberships } from "../queries/get-memberships";
import { MembershipDeleteButton } from "./membership-delete-button";

type MembershipListProps = {
  organizationId: string;
};

const MembershipList = async ({ organizationId }: MembershipListProps) => {
  const auth = await getAuthOrRedirect();
  const memberships = await getMemberships(organizationId);

  // Check if current user can manage members
  const canManageMembers = await hasPermission(
    auth.user.id,
    organizationId,
    PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead>Verified Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership) => {
          const roleName = membership.role?.name || "No Role";

          const permissionsButton = (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={memberPermissionsPath(
                  membership.organizationId,
                  membership.userId,
                )}
              >
                <LucideShieldCheck className="w-4 h-4 mr-2" />
                Manage
              </Link>
            </Button>
          );

          const deleteButton = (
            <MembershipDeleteButton
              organizationId={membership.organizationId}
              userId={membership.userId}
              currentUserId={auth.user.id}
            />
          );

          const buttons = (
            <>
              {canManageMembers && permissionsButton}
              {deleteButton}
            </>
          );

          return (
            <TableRow key={membership.userId}>
              <TableCell>{membership.user.username}</TableCell>
              <TableCell>{membership.user.email}</TableCell>
              <TableCell>
                {format(membership.joinedAt, "yyyy-MM-dd, HH:mm")}
              </TableCell>
              <TableCell>
                {membership.user.emailVerified ? (
                  <LucideCheck />
                ) : (
                  <LucideBan />
                )}
              </TableCell>

              <TableCell>
                <span className="text-sm">{roleName}</span>
              </TableCell>

              <TableCell>
                {canManageMembers ? (
                  permissionsButton
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell className="flex justify-end gap-x-2">
                {buttons}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export { MembershipList };
