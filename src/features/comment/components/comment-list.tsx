import { AttachmentCreateButton } from "@/features/attachment/components/attachment-create-button";
import { AttachmentDeleteButton } from "@/features/attachment/components/attachment-delete-button";
import { AttachmentList } from "@/features/attachment/components/attachment-list";
import type { CommentWithMetadata } from "../types";
import { CommentDeleteButton } from "./comment-delete-button";
import { CommentEditButton } from "./comment-edit-button";
import { CommentItem } from "./comment-item";

type CommentListProps = {
  comments: CommentWithMetadata[];
  ticketId: string;
  onDeleteComment: (id: string) => void;
  onEditComment: (id: string) => void;
  onCreateAttachment?: () => void;
  onDeleteAttachment?: (commentId: string, attachmentId: string) => void;
};

const CommentList = ({
  comments,
  onDeleteComment,
  onCreateAttachment,
  onDeleteAttachment,
  ticketId,
  onEditComment,
}: CommentListProps) => {
  return (
    <>
      {comments.map((comment) => {
        const attachmentCreateButton = (
          <AttachmentCreateButton
            key="2"
            entityId={comment.id}
            entity="COMMENT"
            onCreateAttachment={onCreateAttachment}
          />
        );

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
          ...(comment.isOwner
            ? [commentDeleteButton, commonEditButton, attachmentCreateButton]
            : []),
        ];

        const sections = [];

        if (comment.attachments?.length) {
          sections.push({
            label: "Attachments",
            content: (
              <AttachmentList
                attachments={comment.attachments}
                buttons={(attachmentId) => [
                  ...(comment.isOwner
                    ? [
                        <AttachmentDeleteButton
                          key="0"
                          id={attachmentId}
                          onDeleteAttachment={(attachmentId) =>
                            onDeleteAttachment?.(comment.id, attachmentId)
                          }
                        />,
                      ]
                    : []),
                ]}
              />
            ),
          });
        }

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            buttons={buttons}
            sections={[]}
          />
        );
      })}
    </>
  );
};

export { CommentList };
