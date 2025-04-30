import { Ticket } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getTickets = async (userId: string | undefined): Promise<Ticket[]> => {
  return await prisma.ticket.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
}