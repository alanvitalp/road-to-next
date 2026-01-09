"use client";

import { LucideTrash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/features/ticket/components/confirm-dialog";
import { deleteRole } from "../actions/delete-role";

type RoleDeleteButtonProps = {
  roleId: string;
  roleName: string;
};

const RoleDeleteButton = ({ roleId, roleName }: RoleDeleteButtonProps) => {
  const router = useRouter();

  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: async () => {
      return await deleteRole(roleId);
    },
    title: `Delete role "${roleName}"?`,
    description: `Are you sure you want to delete this role? Members assigned to this role will lose their role-based permissions. This action cannot be undone.`,
    loadingMessage: "Deleting role...",
    trigger: (isLoading) => (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isLoading}
      >
        <LucideTrash className="w-4 h-4" />
      </Button>
    ),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      router.refresh();
    },
  });

  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { RoleDeleteButton };
