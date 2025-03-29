import { Ticket } from "@prisma/client";
import clsx from "clsx";
import { LucideMoreVertical, LucidePencil, LucideSquareArrowOutUpRight, LucideTrash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { editTicketPath, ticketPath } from "@/path";
import { toCurrencyFromCent } from "@/utils/currency";
import { deleteTicket } from "../actions/delete-ticket";
import { TICKET_ICONS } from "../constants";
import { TicketMoreMenu } from "./ticket-more-menu";

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
        <LucidePencil className="w-4 h-4" />
      </Link>
    </Button>
  )

  const deleteButton = (
    <form action={deleteTicket.bind(null, ticket.id)}>
      <Button variant="outline" size="icon">
        <LucideTrash className="w-4 h-4" />
      </Button>
    </form>
  )

  const moreMenu = (
    <TicketMoreMenu 
      ticket={ticket} 
      trigger={
        <Button variant="outline" size="icon">
          <LucideMoreVertical className="w-4 h-4" />
        </Button>
      }
    />
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

        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">{ticket.deadline}</p>
          <p className="text-sm text-muted-foreground">{toCurrencyFromCent(ticket.bounty)}</p>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-y-1">
        {isDetail ? (
          <>
            {editButton}
            {deleteButton}
            {moreMenu}
          </>
        ) : (
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