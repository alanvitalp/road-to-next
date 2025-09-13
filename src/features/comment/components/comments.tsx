import { CardCompact } from "@/components/card-compact";
import { CommentWithMetadata } from "../types";
import { CommentDeleteButton } from "./comment-delete-button";
import { CommentEditButton } from "./comment-edit-button";
import { CommentItem } from "./comment-item";
import { CommentUpsertForm } from "./comment-upsert-form";

type CommentsProps = {
  ticketId: string;
  comments?: CommentWithMetadata[];
};

const Comments = ({ ticketId, comments = [] }: CommentsProps) => {
  return (
    <>
      <CardCompact
        title="Create Comment"
        description="A new comment will be created"
        content={<CommentUpsertForm ticketId={ticketId} />}
      />

      <div className="flex flex-col gap-y-2 ml-8">
        {comments.map((comment) => (
          <CommentItem
          key={comment.id}
          comment={comment}
          buttons={[
            ...(comment.isOwner
              ? [<CommentDeleteButton key="0" id={comment.id} />, <CommentEditButton key="1" ticketId={ticketId} comment={comment}/>]
              : []),
          ]}
        />
        ))}
      </div>
    </>
  );
};

export { Comments };