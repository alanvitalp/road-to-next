import { notFound } from "next/navigation";
import { CardCompact } from "@/components/card-compact";
import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { UpsertTicketForm } from "@/features/ticket/components/upsert-ticket-form";
import { getTicket } from "@/features/ticket/queries/get-ticket";

type EditTicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function EditTicketPage ({ params }: EditTicketPageProps) {
  const { ticketId } = await params;
  
  const { user } = await getAuth();
  const ticket = await getTicket(ticketId);

  const isTicketFound = !!ticket;
  const isTicketOwner = isOwner(user, ticket);
  
  if (!isTicketFound || !isTicketOwner) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <CardCompact 
        title="Edit Ticket"
        description="Edit an existing ticket"
        className="w-full max-w-[420px] animate-fade-from-top"
        content={<UpsertTicketForm ticket={ticket} />}
      />
    </div>
  )
}
