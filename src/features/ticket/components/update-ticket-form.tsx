import { Ticket } from "@prisma/client"
import { Label } from "@radix-ui/react-label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateTicket } from "../actions/update-ticket"

type UpdateTicketFormProps = {
  ticket: Ticket
}

const UpdateTicketForm = ({ ticket }: UpdateTicketFormProps) => {
  return (
    <form action={updateTicket} className="flex flex-col gap-y-2">
      <Input type="hidden" name="id" defaultValue={ticket.id} />

      <Label htmlFor="title">Title</Label>
      <Input id="title" type="text" name="title" defaultValue={ticket.title} />

      <Label htmlFor="content">Content</Label>
      <Textarea id="content" name="content" defaultValue={ticket.content}/>

      <Button type="submit">
        Update
      </Button>
    </form>
  )
}

export { UpdateTicketForm }