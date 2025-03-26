"use client"

import { Ticket } from "@prisma/client"
import { Label } from "@radix-ui/react-label"
import { useActionState } from "react"
import { FieldError } from "@/components/form/field-error"
import { SubmitButton } from "@/components/form/submit-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { upsertTicket } from "../actions/upsert-ticket"

type UpsertTicketFormProps = {
  ticket?: Ticket
}

const UpsertTicketForm = ({ ticket }: UpsertTicketFormProps) => {
  const [actionState, action] = useActionState(
    upsertTicket.bind(null, ticket?.id), 
    {
      message: "",
      fieldErrors: {},
    }
  )

  return (
    <form action={action} className="flex flex-col gap-y-2">
      <Input type="hidden" name="id" defaultValue={ticket?.id} />

      <Label htmlFor="title">Title</Label>
      <Input id="title" type="text" name="title" defaultValue={(actionState.payload?.get("title") as string) ?? ticket?.title} />
      <FieldError actionState={actionState} name="title" />

      <Label htmlFor="content">Content</Label>
      <Textarea id="content" name="content" defaultValue={(actionState.payload?.get("content") as string) ?? ticket?.content}/>
      <FieldError actionState={actionState} name="content" />

      <SubmitButton label={ticket?.id ? "Update" : "Create"}/>

      {actionState.message}
    </form>
  )
}

export { UpsertTicketForm }