"use client";

import { LucidePencil } from "lucide-react";
import { useActionState } from "react";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { upsertComment } from "../actions/upsert-comment";
import { CommentWithMetadata } from "../types";
import { useEditCommentDialog } from "./edit-comment-dialog";

type CommentEditButtonProps = {
  ticketId: string;
  comment: CommentWithMetadata;
  onEditComment: (id: string, content: string) => void;
};

const CommentEditButton = ({ ticketId, comment, onEditComment }: CommentEditButtonProps) => {
  const [actionState, action] = useActionState(
    upsertComment.bind(null, ticketId, comment.id), EMPTY_ACTION_STATE,
  )

  const [editButton, editDialog] = useEditCommentDialog({
    action,
    actionState,
    trigger: (
      <Button variant="outline" size="icon">
        <LucidePencil className="w-4 h-4" />
      </Button>
    ),
    onSuccess: (actionState) => onEditComment?.(comment.id, actionState.payload?.get("content") as string),
  });

  return (
    <>
      {editDialog}
      {editButton}
    </>
  );
};

export { CommentEditButton };