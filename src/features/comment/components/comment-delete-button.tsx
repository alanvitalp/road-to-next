"use client";

import { LucideTrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/features/ticket/components/confirm-dialog";
import { deleteComment } from "../actions/delete-comment";

type CommentDeleteButtonProps = {
  id: string;
};

const CommentDeleteButton = ({ id }: CommentDeleteButtonProps) => {
  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: deleteComment.bind(null, id),
    trigger: (
      <Button variant="outline" size="icon">
        <LucideTrash className="w-4 h-4" />
      </Button>
    ),
  });

  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { CommentDeleteButton };