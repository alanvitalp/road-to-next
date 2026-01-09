"use client";

import { useQueryState, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { Pagination } from "@/components/pagination/pagination";
import type { PaginatedData } from "@/types/pagination";
import {
  filterParser,
  paginationOptions,
  paginationParser,
  searchParser,
} from "../search-params";
import type { TicketWithMetadata } from "../types";

type TicketPaginationProps = {
  paginatedTicketMetadata: PaginatedData<TicketWithMetadata>["metadata"];
};

const TicketPagination = ({
  paginatedTicketMetadata,
}: TicketPaginationProps) => {
  const [pagination, setPagination] = useQueryStates(
    paginationParser,
    paginationOptions,
  );

  const [search] = useQueryState("search", searchParser);
  const [filter] = useQueryState("filter", filterParser);
  const prevSearch = useRef(search);
  const prevFilter = useRef(filter);

  useEffect(() => {
    if (search === prevSearch.current && filter === prevFilter.current) return;
    prevSearch.current = search;
    prevFilter.current = filter;

    setPagination({ ...pagination, page: 0 });

    // add more reactive effects here once needed ...
  }, [search, filter, pagination, setPagination]);

  return (
    <Pagination
      pagination={pagination}
      onPagination={setPagination}
      paginatedMetadata={paginatedTicketMetadata}
    />
  );
};

export { TicketPagination };
