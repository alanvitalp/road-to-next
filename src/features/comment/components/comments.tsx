"use client";

import { useState } from "react";
import { CardCompact } from "@/components/card-compact";
import { Button } from "@/components/ui/button";
import { getComments } from "../queries/get-comments";
import { CommentWithMetadata } from "../types";
import { CommentDeleteButton } from "./comment-delete-button";
import { CommentEditButton } from "./comment-edit-button";
import { CommentItem } from "./comment-item";
import { CommentUpsertForm } from "./comment-upsert-form";

type CommentsProps = {
  ticketId: string;
  paginatedComments: {
    list: CommentWithMetadata[];
    metadata: { count: number; hasNextPage: boolean };
  };
};

const Comments = ({ ticketId, paginatedComments }: CommentsProps) => {
  const [comments, setComments] = useState(paginatedComments.list);
  const [metadata, setMetadata] = useState(paginatedComments.metadata);

   const handleMore = async () => {
    const morePaginatedComments = await getComments(ticketId, comments.length);
    const moreComments = morePaginatedComments.list;
    setComments([...comments, ...moreComments]);
    setMetadata(morePaginatedComments.metadata);
  };

  const handleDeleteComment = (id: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id)
    );
  };

  const handleEditComment = (id: string, content: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) => 
        comment.id === id ? { ...comment, content } : comment
      )
    );
  }

  const handleCreateComment = (newComment: CommentWithMetadata) => {
    setComments((prevComments) => [newComment, ...prevComments]);
  };

  return (
    <>
      <CardCompact
        title="Create Comment"
        description="A new comment will be created"
        content={<CommentUpsertForm ticketId={ticketId} onCreateComment={handleCreateComment}/>}
      />

      <div className="flex flex-col gap-y-2 ml-8">
        {comments.map((comment) => (
          <CommentItem
          key={comment.id}
          comment={comment}
          buttons={[
            ...(comment.isOwner
              ? [
              <CommentDeleteButton key="0" id={comment.id} onDeleteComment={handleDeleteComment} />, 
              <CommentEditButton key="1" ticketId={ticketId} comment={comment} onEditComment={handleEditComment} />
            ]
              : []),
          ]}
        />
        ))}
      </div>

      {metadata.hasNextPage && (
        <Button variant="ghost" onClick={handleMore}>
          More
        </Button>
      )}
    </>
  );
};

export { Comments };