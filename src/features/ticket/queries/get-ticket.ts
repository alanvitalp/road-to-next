import { Ticket } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getTicket = async (id: string): Promise<Ticket | null> => {
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