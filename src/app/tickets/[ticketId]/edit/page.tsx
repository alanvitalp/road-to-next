import { notFound } from "next/navigation";
import { CardCompact } from "@/components/card-compact";
import { UpsertTicketForm } from "@/features/ticket/components/upsert-ticket-form";
import { getTicket } from "@/features/ticket/queries/get-ticket";

type EditTicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function EditTicketPage ({ params }: EditTicketPageProps) {
  const { ticketId } = await params;

  const ticket = await getTicket(ticketId);

  if (!ticket) {
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
