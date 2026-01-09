import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CardCompact } from "@/components/card-compact";
import { Heading } from "@/components/heading";
import { Placeholder } from "@/components/placeholder";
import { Spinner } from "@/components/spinner";
import { getAuth } from "@/features/auth/queries/get-auth";
import { TicketFilterTabs } from "@/features/ticket/components/ticket-filter-tabs";
import { TicketList } from "@/features/ticket/components/ticket-list";
import { UpsertTicketForm } from "@/features/ticket/components/upsert-ticket-form";
import { searchParamsCache } from "@/features/ticket/search-params";

type TicketsPageProps = {
  searchParams: Promise<SearchParams>;
};

const TicketsPage = async ({ searchParams }: TicketsPageProps) => {
  const { user } = await getAuth();
  const parsedSearchParams = searchParamsCache.parse(await searchParams);
  const byOrganization = parsedSearchParams.filter === "organization";

  return (
    <div className="flex flex-col flex-1 gap-y-8">
      <Heading
        title={"My Tickets"}
        description={"All your tickets at one place"}
      />

      <CardCompact
        title="Create Ticket"
        description="A new ticket will be created"
        content={<UpsertTicketForm />}
        className="w-full max-w-[420px] self-center"
      />

      <TicketFilterTabs />

      <ErrorBoundary fallback={<Placeholder label="Something went wrong!" />}>
        <Suspense fallback={<Spinner />}>
          <TicketList
            userId={user?.id}
            searchParams={parsedSearchParams}
            byOrganization={byOrganization}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default TicketsPage;
