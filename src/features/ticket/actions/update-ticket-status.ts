"use server"

import { fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/path";
import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateTicketStatus = async (id: string, status: TicketStatus) => {
  try {
    await prisma.ticket.update({
      where: {
        id,
      },
      data: {
        status,
      }
    })
  } catch (err) {
    fromErrorToActionState(err);
  }

  revalidatePath(ticketsPath());

  return toActionState("SUCCESS", "Status updated")
};