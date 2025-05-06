import { Prisma } from "@prisma/client";
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export type TicketWithMetadata = Prisma.TicketGetPayload<{
  include: {
    user: {
      select: { username: true };
    };
  };
}>;

export const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("newest"),
});

export type ParsedSearchParams = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;