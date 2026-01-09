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
  await prisma.role.deleteMany();

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

  // Create memberships first
  await prisma.membership.createMany({
    data: [
      {
        userId: dbUsers[0].id,
        organizationId: dbOrganization.id,
        isActive: true,
      },
      {
        userId: dbUsers[1].id,
        organizationId: dbOrganization.id,
        isActive: false,
      },
    ],
  });

  // Create Admin role
  const adminRole = await prisma.role.create({
    data: {
      organizationId: dbOrganization.id,
      name: "Admin",
      description: "Full access to all features",
      permissions: {
        create: [
          { key: "ticket:create", value: true },
          { key: "ticket:read", value: true },
          { key: "ticket:update", value: true },
          { key: "ticket:delete", value: true },
          { key: "ticket:update_status", value: true },
          { key: "comment:create", value: true },
          { key: "comment:read", value: true },
          { key: "comment:update", value: true },
          { key: "comment:delete", value: true },
          { key: "organization:update", value: true },
          { key: "organization:delete", value: true },
          { key: "organization:manage_members", value: true },
          { key: "member:invite", value: true },
          { key: "member:remove", value: true },
          { key: "member:update_role", value: true },
          { key: "member:update_permissions", value: true },
        ],
      },
    },
  });

  // Create Member role
  const memberRole = await prisma.role.create({
    data: {
      organizationId: dbOrganization.id,
      name: "Member",
      description: "Basic member with read and create access",
      permissions: {
        create: [
          { key: "ticket:read", value: true },
          { key: "ticket:create", value: true },
          { key: "comment:read", value: true },
          { key: "comment:create", value: true },
        ],
      },
    },
  });

  // Assign roles to members
  await prisma.membership.update({
    where: {
      membershipId: {
        userId: dbUsers[0].id,
        organizationId: dbOrganization.id,
      },
    },
    data: {
      roleId: adminRole.id,
    },
  });

  await prisma.membership.update({
    where: {
      membershipId: {
        userId: dbUsers[1].id,
        organizationId: dbOrganization.id,
      },
    },
    data: {
      roleId: memberRole.id,
    },
  });

  const dbTickets = await prisma.ticket.createManyAndReturn({
    data: tickets.map((ticket) => ({
      ...ticket,
      userId: dbUsers[0].id,
      organizationId: dbOrganization.id,
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
