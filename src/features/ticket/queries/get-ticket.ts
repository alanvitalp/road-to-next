import { prisma } from "@/lib/prisma";
import { TicketWithMetadata } from "../types";

export const getTicket = async (id: string): Promise<TicketWithMetadata | null> => {
  return await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  })
}