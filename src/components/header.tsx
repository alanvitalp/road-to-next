import { LucideKanban } from "lucide-react"
import Link from "next/link"
import { homePath, signUpPath, ticketsPath } from "@/path"
import { ThemeSwitcher } from "./theme/theme-switcher"
import { buttonVariants } from "./ui/button"

const Header = () => {

  const navItems = (
    <>
      <Link href={ticketsPath()} className={buttonVariants({ variant: "default" })}>
        Tickets
      </Link>
      <Link href={signUpPath()} className={buttonVariants({ variant: "outline" })}>
        Sign Up
      </Link>
      <Link href={signUpPath()} className={buttonVariants({ variant: "outline" })}>
        Sign In
      </Link>
    </>
  )
  return (
    <>
      <nav className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur w-ful flex py-2.5 px-5 justify-between">
        <div className="flex align-items gap-x-2">
          <Link href={homePath()} className={buttonVariants({ variant: "ghost" })}>
            <LucideKanban />
            <h1 className="text-lg font-semibold">TicketBounty</h1>
          </Link>
        </div>
        <div className="flex items-center gap-x-2">
          <ThemeSwitcher />
          {navItems}
        </div>
      </nav>
    </>
  )
}

export { Header }