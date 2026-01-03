"use client";

import { LucideLoaderCircle, LucideTrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/features/ticket/components/confirm-dialog";
import { deleteOrganization } from "../actions/delete-organization";
import { useRouter } from "next/navigation";

type OrganizationDeleteButtonProps = {
  organizationId: string;
};

const OrganizationDeleteButton = ({
  organizationId,
}: OrganizationDeleteButtonProps) => {
  const router = useRouter();

  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: deleteOrganization.bind(null, organizationId),
    trigger: (isPending) => (
      <Button variant="destructive" size="icon">
        {isPending ? (
          <LucideLoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <LucideTrash className="w-4 h-4" />
        )}
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

export { OrganizationDeleteButton };
