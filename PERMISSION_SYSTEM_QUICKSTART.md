# Permission System Quick Start Guide

## 🚀 Getting Started

This guide will help you implement and use the new scalable permission system in your application.

## 📋 Prerequisites

Before you begin, ensure you have:
- PostgreSQL database running
- Prisma CLI installed
- Understanding of your application's authentication flow

## 🔧 Setup Steps

### 1. Run Database Migration

Generate Prisma client with the new models:

```bash
npx prisma generate
npx prisma migrate dev --name add_permission_system
```

This will create the following tables:
- `Permission` - User-specific permissions
- `Role` - Role definitions
- `RolePermission` - Permissions assigned to roles

### 2. Seed Default Roles (Optional)

Create a seed script to add default roles to your organizations:

```typescript
// prisma/seed-permissions.ts
import { prisma } from "@/lib/prisma";
import { DEFAULT_ROLES, PERMISSIONS } from "@/features/permission/constants";

async function seedRoles() {
  const organizations = await prisma.organization.findMany();

  for (const org of organizations) {
    // Create Admin role
    await prisma.role.create({
      data: {
        organizationId: org.id,
        name: DEFAULT_ROLES.ADMIN.name,
        description: DEFAULT_ROLES.ADMIN.description,
        permissions: {
          create: DEFAULT_ROLES.ADMIN.permissions.map((key) => ({
            key,
            value: true,
          })),
        },
      },
    });

    // Create Editor role
    await prisma.role.create({
      data: {
        organizationId: org.id,
        name: DEFAULT_ROLES.EDITOR.name,
        description: DEFAULT_ROLES.EDITOR.description,
        permissions: {
          create: DEFAULT_ROLES.EDITOR.permissions.map((key) => ({
            key,
            value: true,
          })),
        },
      },
    });

    // Create Viewer role
    await prisma.role.create({
      data: {
        organizationId: org.id,
        name: DEFAULT_ROLES.VIEWER.name,
        description: DEFAULT_ROLES.VIEWER.description,
        permissions: {
          create: DEFAULT_ROLES.VIEWER.permissions.map((key) => ({
            key,
            value: true,
          })),
        },
      },
    });
  }
}

seedRoles();
```

Run the seed:
```bash
npx tsx prisma/seed-permissions.ts
```

### 3. Migrate Existing Permissions

If you have existing boolean columns (like `canDeleteTicket`), migrate them:

```typescript
// scripts/migrate-permissions.ts
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/features/permission/constants";

async function migratePermissions() {
  const memberships = await prisma.membership.findMany({
    where: {
      canDeleteTicket: true,
    },
  });

  for (const membership of memberships) {
    await prisma.permission.upsert({
      where: {
        userId_organizationId_key: {
          userId: membership.userId,
          organizationId: membership.organizationId,
          key: PERMISSIONS.TICKET_DELETE,
        },
      },
      update: {
        value: true,
      },
      create: {
        userId: membership.userId,
        organizationId: membership.organizationId,
        key: PERMISSIONS.TICKET_DELETE,
        value: true,
      },
    });
  }

  console.log(`Migrated ${memberships.length} permissions`);
}

migratePermissions();
```

## 💻 Usage Examples

### Server-Side: Check Permission in Action

```typescript
// src/features/ticket/actions/delete-ticket.ts
"use server";

import { hasPermission } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";
import { toActionState } from "@/components/form/utils/to-action-state";

export const deleteTicket = async (ticketId: string) => {
  const auth = await getAuth();
  const ticket = await getTicket(ticketId);

  // Check permission
  const canDelete = await hasPermission(
    auth.user.id,
    ticket.organizationId,
    PERMISSIONS.TICKET_DELETE
  );

  if (!canDelete) {
    return toActionState("ERROR", "You don't have permission to delete tickets");
  }

  await prisma.ticket.delete({ where: { id: ticketId } });
  
  return toActionState("SUCCESS", "Ticket deleted");
};
```

### Server Component: Display Permission-Based UI

```tsx
// src/features/ticket/components/ticket-actions.tsx
import { hasPermission } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";
import { DeleteTicketButton } from "./delete-ticket-button";

type TicketActionsProps = {
  ticketId: string;
  userId: string;
  organizationId: string;
};

const TicketActions = async ({ 
  ticketId, 
  userId, 
  organizationId 
}: TicketActionsProps) => {
  const canDelete = await hasPermission(
    userId,
    organizationId,
    PERMISSIONS.TICKET_DELETE
  );

  return (
    <div className="flex gap-x-2">
      {canDelete && <DeleteTicketButton ticketId={ticketId} />}
    </div>
  );
};
```

### Client Component: Use Permission Hook

```tsx
// src/features/ticket/components/ticket-card.tsx
"use client";

import { usePermission } from "@/features/permission/hooks/use-permission";
import { PERMISSIONS } from "@/features/permission/constants";

type TicketCardProps = {
  ticket: Ticket;
  userId: string;
  organizationId: string;
};

export function TicketCard({ ticket, userId, organizationId }: TicketCardProps) {
  const { data: canDelete, isLoading } = usePermission({
    userId,
    organizationId,
    permissionKey: PERMISSIONS.TICKET_DELETE,
  });

  return (
    <div className="card">
      <h3>{ticket.title}</h3>
      {!isLoading && canDelete && (
        <DeleteButton ticketId={ticket.id} />
      )}
    </div>
  );
}
```

### Check Multiple Permissions

```typescript
import { hasPermissions } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";

const permissions = await hasPermissions(
  userId,
  organizationId,
  [
    PERMISSIONS.TICKET_DELETE,
    PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_UPDATE_STATUS,
  ]
);

const canDelete = permissions[PERMISSIONS.TICKET_DELETE];
const canUpdate = permissions[PERMISSIONS.TICKET_UPDATE];
const canUpdateStatus = permissions[PERMISSIONS.TICKET_UPDATE_STATUS];
```

## 🎨 UI Components

### Permission Toggle for Membership Management

```tsx
// In your membership list
import { PermissionList } from "@/features/permission/components/permission-list";

<PermissionList
  userId={membership.userId}
  organizationId={membership.organizationId}
  isAdmin={membership.membershipRole === "ADMIN"}
  canManagePermissions={currentUserCanManage}
/>
```

### Single Permission Toggle

```tsx
import { PermissionToggle } from "@/features/permission/components/permission-toggle";
import { PERMISSIONS } from "@/features/permission/constants";

<PermissionToggle
  userId={userId}
  organizationId={organizationId}
  permissionKey={PERMISSIONS.TICKET_DELETE}
  hasPermission={userCanDelete}
/>
```

## 🔐 Role Management

### Create a Role

```typescript
import { createRole } from "@/features/permission/actions/manage-permissions";
import { PERMISSIONS } from "@/features/permission/constants";

const result = await createRole({
  organizationId: "org-123",
  name: "Content Manager",
  description: "Manages all content",
  permissions: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_DELETE,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_READ,
  ],
});
```

### Assign Role to User

```typescript
import { assignRole } from "@/features/permission/actions/manage-permissions";

const result = await assignRole({
  userId: "user-123",
  organizationId: "org-456",
  roleId: "role-789", // or null to remove role
});
```

### Get Organization Roles

```typescript
import { getOrganizationRoles } from "@/features/permission/queries/manage-permissions";

const roles = await getOrganizationRoles(organizationId);

// Display roles in a select
<select>
  <option value="">No Role</option>
  {roles.map((role) => (
    <option key={role.id} value={role.id}>
      {role.name} ({role._count.memberships} members)
    </option>
  ))}
</select>
```

## ➕ Adding New Permissions

### Step 1: Add to Constants

```typescript
// src/features/permission/constants.ts
export const PERMISSIONS = {
  // ... existing permissions
  TICKET_EXPORT: "ticket:export",
  REPORT_VIEW: "report:view",
  REPORT_CREATE: "report:create",
} as const;
```

### Step 2: Add Metadata

```typescript
export const PERMISSION_METADATA: Record<PermissionKey, {...}> = {
  // ... existing metadata
  [PERMISSIONS.TICKET_EXPORT]: {
    label: "Export Tickets",
    description: "Allows exporting tickets to CSV/PDF",
    category: "ticket",
  },
  [PERMISSIONS.REPORT_VIEW]: {
    label: "View Reports",
    description: "Allows viewing organization reports",
    category: "organization",
  },
};
```

### Step 3: Use Immediately

```typescript
// No migration needed!
const canExport = await hasPermission(
  userId,
  organizationId,
  PERMISSIONS.TICKET_EXPORT
);
```

## 🔄 Migration Path (Old → New)

### Phase 1: Parallel Running (Recommended)
Keep both systems active during migration:

```typescript
// Check both old and new system
const legacyPermission = membership.canDeleteTicket;
const newPermission = await hasPermission(
  userId,
  organizationId,
  PERMISSIONS.TICKET_DELETE
);

// Use new system as source of truth
const canDelete = newPermission || legacyPermission;
```

### Phase 2: Migrate Feature by Feature
Update one feature at a time:

1. Update ticket deletion to use new system
2. Update ticket editing to use new system
3. Update other features
4. Remove boolean columns

### Phase 3: Cleanup
Once all features migrated:

```prisma
model Membership {
  // Remove these after full migration:
  // canDeleteTicket Boolean @default(true)
  // canUpdateTicket Boolean @default(true)
}
```

## 🧪 Testing

### Test Permission Checking

```typescript
// __tests__/permissions.test.ts
import { hasPermission } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";

describe("Permission System", () => {
  it("should grant admin all permissions", async () => {
    const canDelete = await hasPermission(
      adminUserId,
      organizationId,
      PERMISSIONS.TICKET_DELETE
    );
    expect(canDelete).toBe(true);
  });

  it("should respect direct permissions", async () => {
    await setUserPermission(
      userId,
      organizationId,
      PERMISSIONS.TICKET_DELETE,
      true
    );

    const canDelete = await hasPermission(
      userId,
      organizationId,
      PERMISSIONS.TICKET_DELETE
    );
    expect(canDelete).toBe(true);
  });

  it("should inherit from role", async () => {
    const role = await createRole({
      organizationId,
      name: "Editor",
      permissions: [PERMISSIONS.TICKET_UPDATE],
    });

    await assignRole({ userId, organizationId, roleId: role.id });

    const canUpdate = await hasPermission(
      userId,
      organizationId,
      PERMISSIONS.TICKET_UPDATE
    );
    expect(canUpdate).toBe(true);
  });
});
```

## 🐛 Troubleshooting

### Permission Not Working

1. **Verify user is in organization:**
```typescript
const membership = await prisma.membership.findUnique({
  where: { membershipId: { userId, organizationId } }
});
console.log("Membership:", membership);
```

2. **Check permission record:**
```typescript
const permission = await prisma.permission.findUnique({
  where: {
    userId_organizationId_key: {
      userId,
      organizationId,
      key: PERMISSIONS.TICKET_DELETE,
    },
  },
});
console.log("Permission:", permission);
```

3. **Check role assignment:**
```typescript
const membership = await prisma.membership.findUnique({
  where: { membershipId: { userId, organizationId } },
  include: { role: { include: { permissions: true } } },
});
console.log("Role:", membership?.role);
```

### TypeScript Errors After Adding Models

Run Prisma generate:
```bash
npx prisma generate
```

Restart your TypeScript server (VS Code: Cmd+Shift+P → "Restart TypeScript Server")

## 📚 Next Steps

1. Review full documentation: [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md)
2. Migrate existing features one by one
3. Create custom roles for your organization needs
4. Add new permissions as features are developed
5. Monitor performance and add caching if needed

## 🎯 Key Benefits

✅ **No migrations needed** when adding new permissions  
✅ **Dynamic role management** without code changes  
✅ **Audit trail** with timestamps  
✅ **Multi-tenant safe** with organization scoping  
✅ **Type-safe** with TypeScript constants  
✅ **Flexible** supports both direct and role-based permissions  

---

**Need Help?**
- See [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md) for full documentation
- Check examples in `src/features/permission/`
- Review test files for usage patterns