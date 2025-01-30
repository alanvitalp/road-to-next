"use client"
import { useEffect, useState } from "react";
import { Heading } from "@/components/heading";
import { TicketItem } from "@/features/ticket/components/ticket-item";
import { getTickets } from "@/features/ticket/queries/get-tickets";
import { Ticket } from "@/features/ticket/types";

const TicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>();

  const fetchTickets = async () => {
    const result = await getTickets();

    setTickets(result);
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <Heading title={"Tickets"} description={"All your tickets at one place"}/>

      <div className="flex-1 flex flex-col items-center gap-y-4 animate-fade-in-from-top">
        {tickets?.map((ticket) => (
          <TicketItem ticket={ticket} key={ticket.id}/>
        ))}
      </div>
    </div>
  )
}

export default TicketsPage;