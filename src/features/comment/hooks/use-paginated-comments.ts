import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { usePaginated } from "@/hooks/use-paginated";
import type { PaginatedData } from "@/types/pagination";
import { getComments } from "../queries/get-comments";
import type { CommentWithMetadata } from "../types";

type CacheArgs = {
  queryClient: QueryClient;
  queryKey: QueryKey;
};

const removeAttachmentFromCache = (
  { queryClient, queryKey }: CacheArgs,
  payload: { attachmentId: string; commentId: string },
) => {
  queryClient.setQueryData<
    InfiniteData<Awaited<ReturnType<typeof getComments>>>
  >(queryKey, (cache) => {
    if (!cache) return cache;

    const pages = cache.pages.map((page) => ({
      ...page,
      list: page.list.map((comment) => {
        if (comment.id === payload.commentId) {
          return {
            ...comment,
            attachments: comment.attachments.filter(
              (attachment) => attachment.id !== payload.attachmentId,
            ),
          };
        }

        return comment;
      }),
    }));

    return { ...cache, pages };
  });
};

export const usePaginatedComments = (
  ticketId: string,
  paginatedComments: PaginatedData<CommentWithMetadata>,
) => {
  const queryKey = ["comments", ticketId];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePaginated(
    {
      queryKey: ["comments", ticketId],
      queryFn: ({ pageParam }) =>
        getComments(ticketId, pageParam as string | undefined),
      initialData: paginatedComments,
    },
  );

  const comments = data.pages.flatMap((page) => page.list);

  const queryClient = useQueryClient();

  const handleDeleteAttachment = (commentId: string, attachmentId: string) => {
    removeAttachmentFromCache(
      { queryClient, queryKey },
      { attachmentId, commentId },
    );

    queryClient.invalidateQueries({ queryKey });
  };

  return {
    comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    onCreateComment: () => queryClient.invalidateQueries({ queryKey }),
    onDeleteComment: () => queryClient.invalidateQueries({ queryKey }),
    onEditComment: () => queryClient.invalidateQueries({ queryKey }),
    onCreateAttachment: () => queryClient.invalidateQueries({ queryKey }),
    onDeleteAttachment: handleDeleteAttachment,
  };
};
