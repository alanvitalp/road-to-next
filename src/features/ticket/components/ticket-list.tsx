import { Placeholder } from "@/components/placeholder";
import { getTickets } from "../queries/get-tickets";
import type { ParsedSearchParams } from "../search-params";
import { TicketItem } from "./ticket-item";
import { TicketPagination } from "./ticket-pagination";
import { TicketSearchInput } from "./ticket-search-input";
import { TicketSortSelect } from "./ticket-sort-select";

type TicketListProps = {
  userId?: string;
  searchParams: ParsedSearchParams;
  byOrganization?: boolean;
};

const TicketList = async ({
  userId,
  searchParams,
  byOrganization = false,
}: TicketListProps) => {
  const { list: tickets, metadata: ticketMetadata } = await getTickets(
    userId,
    byOrganization,
    searchParams,
  );

  const showCount = userId && ticketMetadata.totalCount > 0;
  const countLabel = showCount
    ? `Showing ${ticketMetadata.count} of ${ticketMetadata.totalCount} tickets`
    : null;

  return (
    <div className="flex-1 flex flex-col items-center gap-y-4 animate-fade-from-top">
      <div className="w-full max-w-[420px] flex gap-x-2">
        <TicketSearchInput placeholder="Search tickets ..." />
        <TicketSortSelect
          options={[
            {
              sortKey: "createdAt",
              sortValue: "desc",
              label: "Newest",
            },
            {
              sortKey: "createdAt",
              sortValue: "asc",
              label: "Oldest",
            },
            {
              sortKey: "bounty",
              sortValue: "desc",
              label: "Bounty",
            },
          ]}
        />
      </div>

      {countLabel && (
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      )}

      {tickets.length ? (
        tickets.map((ticket) => <TicketItem key={ticket.id} ticket={ticket} />)
      ) : (
        <Placeholder label="No tickets found" />
      )}

      <div className="w-full max-w-[420px]">
        <TicketPagination paginatedTicketMetadata={ticketMetadata} />
      </div>
    </div>
  );
};

export { TicketList };
