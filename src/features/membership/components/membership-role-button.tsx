"use client";

import type { MembershipRole } from "@prisma/client";
import { LucideLoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMembershipRole } from "../queries/update-membership-role";

type MembershipRoleButtonProps = {
  userId: string;
  organizationId: string;
  currentRole: MembershipRole;
  isCurrentUser: boolean;
  isCurrentUserAdmin: boolean;
  username: string;
};

const MembershipRoleButton = ({
  userId,
  organizationId,
  currentRole,
  isCurrentUser,
  isCurrentUserAdmin,
}: MembershipRoleButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: MembershipRole) => {
    if (newRole === currentRole) return;

    setIsLoading(true);

    try {
      await updateMembershipRole({
        userId,
        organizationId,
        newRole,
      });

      toast.success(`Successfully updated role to ${newRole.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show select if current user is not an admin
  if (!isCurrentUserAdmin) {
    return (
      <span className="text-sm">
        {currentRole === "ADMIN" ? "Admin" : "Member"}
      </span>
    );
  }

  return (
    <Select
      onValueChange={handleRoleChange}
      defaultValue={currentRole}
      disabled={isCurrentUser || isLoading}
    >
      <SelectTrigger className="w-32 h-9">
        {isLoading ? (
          <div className="flex items-center gap-x-2">
            <LucideLoaderCircle className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </div>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">Admin</SelectItem>
        <SelectItem value="MEMBER">Member</SelectItem>
      </SelectContent>
    </Select>
  );
};

export { MembershipRoleButton };
