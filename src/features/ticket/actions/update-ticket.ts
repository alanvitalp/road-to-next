"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ticketsPath } from "@/path"

export const updateTicket = async (formData: FormData) => {
  await prisma.ticket.update({
    where: {
      id: formData.get("id") as string
    }, 
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    }
  })

  revalidatePath(ticketsPath())
  redirect(ticketsPath())
}