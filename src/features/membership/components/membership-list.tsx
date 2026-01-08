import { format } from "date-fns";
import { LucideBan, LucideCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { getMemberships } from "../queries/get-memberships";
import { MembershipDeleteButton } from "./membership-delete-button";
import { MembershipRoleButton } from "./membership-role-button";

type MembershipListProps = {
  organizationId: string;
};

const MembershipList = async ({ organizationId }: MembershipListProps) => {
  const auth = await getAuthOrRedirect();
  const memberships = await getMemberships(organizationId);

  // Check if current user is an admin
  const currentUserMembership = memberships.find(
    (m) => m.userId === auth.user.id,
  );
  const isCurrentUserAdmin = currentUserMembership?.membershipRole === "ADMIN";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead>Verified Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership) => {
          const isCurrentUser = membership.userId === auth.user.id;

          const roleButton = (
            <MembershipRoleButton
              userId={membership.userId}
              organizationId={membership.organizationId}
              currentRole={membership.membershipRole}
              isCurrentUser={isCurrentUser}
              isCurrentUserAdmin={isCurrentUserAdmin}
              username={membership.user.username}
            />
          );

          const deleteButton = (
            <MembershipDeleteButton
              organizationId={membership.organizationId}
              userId={membership.userId}
              currentUserId={auth.user.id}
            />
          );

          const buttons = <>{deleteButton}</>;

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

              <TableCell>{roleButton}</TableCell>

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
