import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    username: "admin",
    email: "admin@admin.com",
  },
  {
    username: "user",
    email: "hello@road-to-next.com",
  },
];

const tickets = [
  {
    title: "ticket 1",
    content: "This is the first ticket from db",
    status: "DONE" as const,
    bounty: 499, 
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title: "ticket 2",
    content: "This is the second ticket from db",
    status: "OPEN" as const,
    bounty: 399, 
    deadline: new Date().toISOString().split("T")[0],
  },
  {
    title: "ticket 3",
    content: "This is the third ticket from db",
    status: "IN_PROGRESS" as const,
    bounty: 299, 
    deadline: new Date().toISOString().split("T")[0],
  },
]

const seed = async () => {
  const t0 = performance.now();

  await prisma.user.deleteMany();
  await prisma.ticket.deleteMany();

  const passwordHash = await hash("geheimnis");

  const dbUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  await prisma.ticket.createMany({
    data: tickets.map((ticket) => ({
      ...ticket,
      userId: dbUsers[0].id,
    })),
  });

  const t1 = performance.now();

  console.log(`DB Seed: Finished (${t1 - t0}ms)`)
}

seed()