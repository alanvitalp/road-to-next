import { type QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import type { PaginatedData } from "@/types/pagination";

interface UsePaginatedProps<T> {
  queryKey: QueryKey;
  queryFn: (context: { pageParam?: unknown }) => Promise<PaginatedData<T>>;
  initialData: PaginatedData<T>;
}

export const usePaginated = <T>({
  queryKey,
  queryFn,
  initialData,
}: UsePaginatedProps<T>) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PaginatedData<T>>({
      queryKey,
      queryFn,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.metadata.hasNextPage ? lastPage.metadata.cursor : undefined,
      initialData: {
        pages: [initialData],
        pageParams: [undefined],
      },
    });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage };
};
