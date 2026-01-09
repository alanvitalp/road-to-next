import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ROLES = {
  ADMIN: {
    name: "Admin",
    description: "Full access to all features",
    permissions: [
      "ticket:create",
      "ticket:read",
      "ticket:update",
      "ticket:delete",
      "ticket:update_status",
      "comment:create",
      "comment:read",
      "comment:update",
      "comment:delete",
      "organization:update",
      "organization:delete",
      "organization:manage_members",
      "member:invite",
      "member:remove",
      "member:update_role",
      "member:update_permissions",
    ],
  },
  MEMBER: {
    name: "Member",
    description: "Basic member with read and create access",
    permissions: [
      "ticket:read",
      "ticket:create",
      "comment:read",
      "comment:create",
    ],
  },
  EDITOR: {
    name: "Editor",
    description: "Can create and edit content",
    permissions: [
      "ticket:create",
      "ticket:read",
      "ticket:update",
      "ticket:update_status",
      "comment:create",
      "comment:read",
      "comment:update",
    ],
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access",
    permissions: ["ticket:read", "comment:read"],
  },
};

async function seedRoles() {
  console.log("🌱 Starting role seeding...");

  // Get all organizations
  const organizations = await prisma.organization.findMany();

  console.log(`📦 Found ${organizations.length} organizations`);

  for (const org of organizations) {
    console.log(`\n🏢 Processing organization: ${org.name} (${org.id})`);

    for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
      // Check if role already exists
      const existingRole = await prisma.role.findUnique({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: roleData.name,
          },
        },
      });

      if (existingRole) {
        console.log(`  ⏭️  Role "${roleData.name}" already exists, skipping...`);
        continue;
      }

      // Create role with permissions
      const role = await prisma.role.create({
        data: {
          organizationId: org.id,
          name: roleData.name,
          description: roleData.description,
          permissions: {
            create: roleData.permissions.map((permission) => ({
              key: permission,
              value: true,
            })),
          },
        },
        include: {
          permissions: true,
        },
      });

      console.log(
        `  ✅ Created role "${roleData.name}" with ${role.permissions.length} permissions`
      );
    }

    // Assign default "Member" role to existing members without a role
    const memberRole = await prisma.role.findUnique({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: "Member",
        },
      },
    });

    if (memberRole) {
      const membersWithoutRole = await prisma.membership.findMany({
        where: {
          organizationId: org.id,
          roleId: null,
        },
      });

      if (membersWithoutRole.length > 0) {
        await prisma.membership.updateMany({
          where: {
            organizationId: org.id,
            roleId: null,
          },
          data: {
            roleId: memberRole.id,
          },
        });

        console.log(
          `  👥 Assigned "Member" role to ${membersWithoutRole.length} members without a role`
        );
      }
    }
  }

  console.log("\n✨ Role seeding completed!");
}

seedRoles()
  .catch((error) => {
    console.error("❌ Error seeding roles:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
