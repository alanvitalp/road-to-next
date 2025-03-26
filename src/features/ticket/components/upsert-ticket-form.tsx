import { Ticket } from "@prisma/client"
import { Label } from "@radix-ui/react-label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { upsertTicket } from "../actions/upsert-ticket"

type UpsertTicketFormProps = {
  ticket?: Ticket
}

const UpsertTicketForm = ({ ticket }: UpsertTicketFormProps) => {
  return (
    <form action={upsertTicket.bind(null, ticket?.id)} className="flex flex-col gap-y-2">
      <Input type="hidden" name="id" defaultValue={ticket?.id} />

      <Label htmlFor="title">Title</Label>
      <Input id="title" type="text" name="title" defaultValue={ticket?.title} />

      <Label htmlFor="content">Content</Label>
      <Textarea id="content" name="content" defaultValue={ticket?.content}/>

      <Button type="submit">
        { ticket?.id ? "Update" : "Create" }
      </Button>
    </form>
  )
}

export { UpsertTicketForm }