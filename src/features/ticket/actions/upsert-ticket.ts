"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"
import { setCookieByKey } from "@/actions/cookies"
import { ActionState, fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state"
import { prisma } from "@/lib/prisma"
import { ticketPath, ticketsPath } from "@/path"

const upsertTicketSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "Title is required" })
    .min(1, { message: "Title must be at least 1 characters long" })
    .max(191, { message: "Title cannot exceed 191 characters" }),
  content: z
    .string()
    .nonempty({ message: "Content is required" })
    .min(1, { message: "Content must be at least 1 characters long" })
    .max(1024, { message: "Content cannot exceed 1024 characters" }),
});

export const upsertTicket = async (id: string | undefined, _actionState: ActionState, formData: FormData) => {
  try {
    const data = upsertTicketSchema.parse({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    })

    await prisma.ticket.upsert({
      where: {
        id: id || ""
      },
      create: data,
      update: data
    })
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  revalidatePath(ticketsPath())
  
  if (id) {
    await setCookieByKey("toast", "Ticket updated");
    redirect(ticketPath(id))
  }

  return toActionState("SUCCESS", "Ticket created!")
}