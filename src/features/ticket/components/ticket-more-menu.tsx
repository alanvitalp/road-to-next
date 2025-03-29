"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { Ticket, TicketStatus } from "@prisma/client"
import { LucideTrash } from "lucide-react"
import React from "react"
import { TICKET_STATUS_LABELS } from "../constants"
import { updateTicketStatus } from "../actions/update-ticket-status"
import { toast } from "sonner"

type TicketMoreMenuProps = {
  ticket: Ticket
  trigger: React.ReactNode
}

const TicketMoreMenu = ({ ticket, trigger }: TicketMoreMenuProps) => {
  const deleteButton = (
    <DropdownMenuItem>
      <LucideTrash className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  )

  const ticketStatusRadioGroupItems = (
    (Object.keys(TICKET_STATUS_LABELS) as Array<TicketStatus>).map((label) => {
      return (
        <DropdownMenuRadioItem value={label} key={label}>{TICKET_STATUS_LABELS[label]}</DropdownMenuRadioItem>
      )
    })
  )

  const handleUpdateTicketStatus = async (value: string) => {
    const promise = updateTicketStatus(ticket?.id, value as TicketStatus);

    toast.promise(promise, {
      loading: "Updating status..."
    })

    const result = await promise

    if (result.status === "ERROR") {
      toast.error(result.message);
    } else if (result.status === "SUCCESS") {
      toast.success(result.message)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right">
        <DropdownMenuRadioGroup value={ticket?.status} onValueChange={handleUpdateTicketStatus}>
         {ticketStatusRadioGroupItems}
        </DropdownMenuRadioGroup>
        {deleteButton}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { TicketMoreMenu }