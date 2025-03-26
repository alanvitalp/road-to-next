import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CardCompact } from "@/components/card-compact";
import { Heading } from "@/components/heading";
import { Placeholder } from "@/components/placeholder";
import { Spinner } from "@/components/spinner";
import { TicketList } from "@/features/ticket/components/ticket-list";
import { UpsertTicketForm } from "@/features/ticket/components/upsert-ticket-form";

const TicketsPage = () => {
  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading title={"Tickets"} description={"All your tickets at one place"}/>
    
      <CardCompact 
        title="Create Ticket" 
        description="A new ticket will be created"
        content={<UpsertTicketForm />} 
        className="w-full max-w-[420px] self-center" 
       />

      <ErrorBoundary fallback={<Placeholder label="Something went wrong!"/>}>
        <Suspense fallback={<Spinner />}>
          <TicketList />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default TicketsPage;