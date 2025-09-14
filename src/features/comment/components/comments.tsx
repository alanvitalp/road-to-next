"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { CardCompact } from "@/components/card-compact";
import { Button } from "@/components/ui/button";
import { PaginatedData } from "@/types/pagination";
import { getComments } from "../queries/get-comments";
import { CommentWithMetadata } from "../types";
import { CommentDeleteButton } from "./comment-delete-button";
import { CommentEditButton } from "./comment-edit-button";
import { CommentItem } from "./comment-item";
import { CommentUpsertForm } from "./comment-upsert-form";

type CommentsProps = {
  ticketId: string;
  paginatedComments: PaginatedData<CommentWithMetadata>;
};

const Comments = ({ ticketId, paginatedComments }: CommentsProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ["comments", ticketId],
    queryFn: ({ pageParam }) => getComments(ticketId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.metadata.hasNextPage ? lastPage.metadata.cursor : undefined,
    initialData: {
      pages: [
        {
          list: paginatedComments.list,
          metadata: paginatedComments.metadata,
        },
      ],
      pageParams: [undefined],
    },
  });

  const comments = data.pages.flatMap((page) => page.list);

  const handleMore = () => fetchNextPage();

  const handleDeleteComment = () => refetch();
  const handleEditComment = () => refetch();
  const handleCreateComment = () => refetch();

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

      {hasNextPage && (
        <Button
          variant="ghost"
          onClick={handleMore}
          disabled={isFetchingNextPage}
        >
          More
        </Button>
      )}
    </>
  );
};

export { Comments };