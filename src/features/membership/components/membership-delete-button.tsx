"use client";

import { LucideLoaderCircle, LucideLogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/features/ticket/components/confirm-dialog";
import { deleteMembership } from "../queries/delete-membership";

type MembershipDeleteButtonProps = {
  userId: string;
  organizationId: string;
  currentUserId?: string;
};

const MembershipDeleteButton = ({
  userId,
  organizationId,
  currentUserId,
}: MembershipDeleteButtonProps) => {
  const router = useRouter();

  const isLeavingOrganization = userId === currentUserId;

  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: deleteMembership.bind(null, {
      userId,
      organizationId,
    }),
    loadingMessage: isLeavingOrganization
      ? "Leaving organization..."
      : "Deleting member...",
    trigger: (isLoading) =>
      isLoading ? (
        <Button variant="destructive" size="icon">
          <LucideLoaderCircle className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button variant="destructive" size="icon">
          <LucideLogOut className="w-4 h-4" />
        </Button>
      ),
    onSuccess: () => {
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

export { MembershipDeleteButton };
