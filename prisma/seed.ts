import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

const tickets = [
  {
    title: "ticket 1",
    content: "This is the first ticket from db",
    status: "DONE" as const,
    bounty: 499, // 4.99
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title: "ticket 2",
    content: "This is the second ticket from db",
    status: "OPEN" as const,
    bounty: 399, // 3.99
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title: "ticket 3",
    content: "This is the third ticket from db",
    status: "IN_PROGRESS" as const,
    bounty: 299, // 2.99
    deadline: new Date().toISOString().split("T")[0],
  },
]

const seed = async () => {
  const t0 = performance.now();
  await prisma.ticket.deleteMany();
  await prisma.ticket.createMany({
    data: tickets
  })
  const t1 = performance.now();

  console.log(`DB Seed: Finished (${t1 - t0}ms)`)
}

seed()