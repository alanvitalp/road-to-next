"use client"

import { Ticket } from "@prisma/client"
import { Label } from "@radix-ui/react-label"
import { useActionState, useRef } from "react"
import { DatePicker } from "@/components/date-picker"
import { FieldError } from "@/components/form/field-error"
import { Form } from "@/components/form/form"
import { SubmitButton } from "@/components/form/submit-button"
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fromCent } from "@/utils/currency"
import { upsertTicket } from "../actions/upsert-ticket"

type UpsertTicketFormProps = {
  ticket?: Ticket
}

const UpsertTicketForm = ({ ticket }: UpsertTicketFormProps) => {
  const [actionState, action] = useActionState(
    upsertTicket.bind(null, ticket?.id), EMPTY_ACTION_STATE
  )

  const datePickerImperativeHandleRef = useRef<{ reset: () => void }>(null);

  const handleSuccess = () => {
    datePickerImperativeHandleRef.current?.reset();
  }

  return (
    <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
      <Input type="hidden" name="id" defaultValue={ticket?.id} />

      <Label htmlFor="title">Title</Label>
      <Input id="title" type="text" name="title" defaultValue={(actionState.payload?.get("title") as string) ?? ticket?.title} />
      <FieldError actionState={actionState} name="title" />

      <Label htmlFor="content">Content</Label>
      <Textarea id="content" name="content" defaultValue={(actionState.payload?.get("content") as string) ?? ticket?.content}/>
      <FieldError actionState={actionState} name="content" />

      <div className="flex mb-1 gap-x-2">
        <div className="w-1/2">
          <Label htmlFor="deadline">Deadline</Label>
          <DatePicker
            id="deadline"
            name="deadline"
            defaultValue={
              (actionState.payload?.get("deadline") as string) ??
              ticket?.deadline
            }
            imperativeHandleRef={datePickerImperativeHandleRef}
          />
          <FieldError actionState={actionState} name="deadline" />
        </div>
        <div className="w-1/2">
          <Label htmlFor="bounty">Bounty ($)</Label>
          <Input
            id="bounty"
            name="bounty"
            type="number"
            step=".01"
            defaultValue={
              (actionState.payload?.get("bounty") as string) ?? (ticket?.bounty ? fromCent(ticket?.bounty) : "")
            }
          />
          <FieldError actionState={actionState} name="bounty" />
        </div>
      </div>

      <SubmitButton label={ticket?.id ? "Update" : "Create"}/>

      {actionState.message}
    </Form>
  )
}

export { UpsertTicketForm }