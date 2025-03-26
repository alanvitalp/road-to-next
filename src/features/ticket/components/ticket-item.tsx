import { Ticket } from "@prisma/client";
import clsx from "clsx";
import { LucidePencil, LucideSquareArrowOutUpRight, LucideTrash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { editTicketPath, ticketPath } from "@/path";
import { deleteTicket } from "../actions/delete-ticket";
import { TICKET_ICONS } from "../constants";

type TicketItemProps = {
  ticket: Ticket;
  isDetail?: boolean
}

const TicketItem = ({ ticket, isDetail }: TicketItemProps) => {
  const detailButton = (
    <Button variant="outline" size="icon" asChild>
      <Link prefetch href={ticketPath(ticket.id)}>
        <LucideSquareArrowOutUpRight className="w-4 h-4"/>
      </Link>
    </Button>
  )
  
  const editButton = (
    <Button variant="outline" size="icon" asChild>
      <Link prefetch href={editTicketPath(ticket.id)}>
        <LucidePencil className="h-4 w-4" />
      </Link>
    </Button>
  )

  const deleteButton = (
    <form action={deleteTicket.bind(null, ticket.id)}>
      <Button variant="outline" size="icon">
        <LucideTrash className="h-4 w-4" />
      </Button>
    </form>
  )

  return (
    <div className={clsx("w-full max-w-[420px] flex gap-x-1", {
      "max-w-[580px]": isDetail,
      "max-w-[420px]": !isDetail
    })}>
      <Card key={ticket.id} className="w-full">
        <CardHeader>
          <CardTitle className="flex gap-x-2">
            <span>{TICKET_ICONS[ticket.status]}</span>
            <span className="truncate">{ticket.title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          
          <p className={clsx("whitespace-break-spaces", {
            "line-clamp-3": !isDetail,
            "line-through": ticket.status === "DONE",
          })}>{ticket.content}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-y-1">
        {isDetail ? deleteButton : (
          <>
            {editButton}
            {detailButton}
          </>
        )
        }
      </div>
    </div>
  )
}

export { TicketItem };