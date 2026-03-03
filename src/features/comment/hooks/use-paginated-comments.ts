import { useQueryClient } from "@tanstack/react-query";
import { usePaginated } from "@/hooks/use-paginated";
import type { PaginatedData } from "@/types/pagination";
import { getComments } from "../queries/get-comments";
import type { CommentWithMetadata } from "../types";

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

  return {
    comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    onCreateComment: () => queryClient.invalidateQueries({ queryKey }),
    onDeleteComment: () => queryClient.invalidateQueries({ queryKey }),
    onEditComment: () => queryClient.invalidateQueries({ queryKey }),
  };
};
