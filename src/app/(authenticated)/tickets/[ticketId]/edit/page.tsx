import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import { UpsertTicketForm } from "@/features/ticket/components/upsert-ticket-form";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { homePath, ticketPath } from "@/path";

type EditTicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function EditTicketPage ({ params }: EditTicketPageProps) {
  const { ticketId } = await params;
  
  const ticket = await getTicket(ticketId);

  const isTicketFound = !!ticket;
  
   if (!isTicketFound || !ticket.isOwner) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Breadcrumbs
        breadcrumbs={[
          { title: "Tickets", href: homePath() },
          { title: ticket.title, href: ticketPath(ticket.id) },
          { title: "Edit" },
        ]}
      />

      <Separator />

      <div className="flex flex-1 flex-col justify-center items-center">
        <CardCompact 
          title="Edit Ticket"
          description="Edit an existing ticket"
          className="w-full max-w-[420px] animate-fade-from-top"
          content={<UpsertTicketForm ticket={ticket} />}
        />
      </div>
    </div>
  )
}
