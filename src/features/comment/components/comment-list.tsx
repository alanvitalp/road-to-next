import type { CommentWithMetadata } from "../types";
import { CommentDeleteButton } from "./comment-delete-button";
import { CommentEditButton } from "./comment-edit-button";
import { CommentItem } from "./comment-item";

type CommentListProps = {
  comments: CommentWithMetadata[];
  ticketId: string;
  onDeleteComment: (id: string) => void;
  onEditComment: (id: string) => void;
};

const CommentList = ({
  comments,
  ticketId,
  onDeleteComment,
  onEditComment,
}: CommentListProps) => {
  return (
    <>
      {comments.map((comment) => {
        const commentDeleteButton = (
          <CommentDeleteButton
            key="0"
            id={comment.id}
            onDeleteComment={onDeleteComment}
          />
        );

        const commonEditButton = (
          <CommentEditButton
            key="1"
            ticketId={ticketId}
            comment={comment}
            onEditComment={onEditComment}
          />
        );

        const buttons = [
          ...(comment.isOwner ? [commentDeleteButton, commonEditButton] : []),
        ];

        return (
          <CommentItem key={comment.id} comment={comment} buttons={buttons} />
        );
      })}
    </>
  );
};

export { CommentList };
