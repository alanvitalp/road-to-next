import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { TicketList } from "@/features/ticket/components/ticket-list";
import { searchParamsCache } from "@/features/ticket/types";

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

const HomePage = async ({ searchParams }: HomePageProps) => {
  await getAuthOrRedirect();
  
  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading
        title="All Tickets"
        description="Tickets by everyone at one place"
      />

      <Suspense fallback={<Spinner />}>
        <TicketList searchParams={searchParamsCache.parse(await searchParams)} />
      </Suspense>
    </div>
  );
}

export default HomePage
