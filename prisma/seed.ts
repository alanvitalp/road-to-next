import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    username: "admin",
    email: "admin@admin.com",
    emailVerified: true,
  },
  {
    username: "user",
    email: "hello@road-to-next.com",
    emailVerified: true,
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
];

const comments = [
  { content: "First comment from DB." },
  { content: "Second comment from DB." },
  { content: "Third comment from DB." },
];

const seed = async () => {
  const t0 = performance.now();

  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.membership.deleteMany();

  const passwordHash = await hash("password");

  const dbUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  const dbOrganization = await prisma.organization.create({
    data: {
      name: "Organization 1",
    },
  });

  await prisma.membership.createMany({
    data: [
      {
        userId: dbUsers[0].id,
        organizationId: dbOrganization.id,
        isActive: true,
        membershipRole: "ADMIN",
      },
      {
        userId: dbUsers[1].id,
        organizationId: dbOrganization.id,
        isActive: false,
        membershipRole: "MEMBER",
      },
    ],
  });

  const dbTickets = await prisma.ticket.createManyAndReturn({
    data: tickets.map((ticket) => ({
      ...ticket,
      userId: dbUsers[0].id,
    })),
  });

  await prisma.comment.createMany({
    data: comments.map((comment) => ({
      ...comment,
      ticketId: dbTickets[0].id,
      userId: dbUsers[1].id,
    })),
  });

  const t1 = performance.now();

  console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
