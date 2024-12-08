import { LucideKanban } from "lucide-react"
import Link from "next/link"
import { homePath, ticketsPath } from "@/path"
import { buttonVariants } from "./ui/button"

const Header = () => {
  return (
    <>
      <nav className="flex justify-between py-2.5 px-5 border-b">
        <div>
          <Link href={homePath()} className={buttonVariants({ variant: "ghost" })}>
            <LucideKanban />
            <h1 className="text-lg font-semibold">TicketBounty</h1>
          </Link>
        </div>
        <div>
          <Link href={ticketsPath()} className={buttonVariants({ variant: "default" })}>
            Tickets
          </Link>
        </div>
      </nav>
    </>
  )
}

export { Header }