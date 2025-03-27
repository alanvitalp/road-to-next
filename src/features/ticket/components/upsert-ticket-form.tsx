"use client"

import { Ticket } from "@prisma/client"
import { Label } from "@radix-ui/react-label"
import { useActionState } from "react"
import { FieldError } from "@/components/form/field-error"
import { Form } from "@/components/form/form"
import { SubmitButton } from "@/components/form/submit-button"
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { upsertTicket } from "../actions/upsert-ticket"

type UpsertTicketFormProps = {
  ticket?: Ticket
}

const UpsertTicketForm = ({ ticket }: UpsertTicketFormProps) => {
  const [actionState, action] = useActionState(
    upsertTicket.bind(null, ticket?.id), EMPTY_ACTION_STATE
  )

  return (
    <Form action={action} actionState={actionState}>
      <Input type="hidden" name="id" defaultValue={ticket?.id} />

      <Label htmlFor="title">Title</Label>
      <Input id="title" type="text" name="title" defaultValue={(actionState.payload?.get("title") as string) ?? ticket?.title} />
      <FieldError actionState={actionState} name="title" />

      <Label htmlFor="content">Content</Label>
      <Textarea id="content" name="content" defaultValue={(actionState.payload?.get("content") as string) ?? ticket?.content}/>
      <FieldError actionState={actionState} name="content" />

      <SubmitButton label={ticket?.id ? "Update" : "Create"}/>

      {actionState.message}
    </Form>
  )
}

export { UpsertTicketForm }