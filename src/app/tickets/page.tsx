import clsx from "clsx";
import { LucideCheckCircle, LucideFileText, LucidePencil } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { initialTickets } from "@/data";
import { ticketPath } from "@/path";

const STATUS_ICON = {
  OPEN: <LucideFileText />,
  IN_PROGRESS: <LucidePencil />,
  DONE: <LucideCheckCircle />
}

const TicketsPage = () => {
  return (
    <div className="flex-1 flex flex-col gap-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">TicketsPage</h2>
        <p className="text-sm text-muted-foreground">
          All your tickets at one place
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center gap-y-4 animate-fade-in-from-top">
        {initialTickets.map((ticket) => (
          <Card key={ticket.id} className="w-full max-w-[420px] p-4 border border-slate-100 rounded">
            <CardHeader>
              <CardTitle className="flex gap-x-2">
                <span>{STATUS_ICON[ticket.status]}</span>
                <span className="truncate">{ticket.title}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
             
              <p className={clsx("line-clamp-3 whitespace-break-spaces", {
                "line-through": ticket.status === "DONE",
              })}>{ticket.content}</p>
            </CardContent>

            <CardFooter>
              <Link href={ticketPath(ticket.id)} className="text-sm underline">
                View
             </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TicketsPage;