# Scalable Permission System Documentation

## Overview

This application uses a robust, scalable permission system that supports:
- **Direct user permissions**: Grant specific permissions to individual users
- **Role-based permissions**: Assign roles with predefined permission sets
- **Dynamic permission management**: Add new permissions without schema migrations
- **Multi-tenant support**: Permissions are scoped per organization
- **Audit trail**: Track when permissions are created/updated

## Architecture

### Database Models

#### Permission Model
Stores direct user permissions as rows (not columns).

```prisma
model Permission {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  key            String   // e.g., "ticket:delete"
  value          Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([userId, organizationId, key])
}
```

#### Role Model
Defines reusable permission templates.

```prisma
model Role {
  id             String           @id @default(cuid())
  name           String
  description    String?
  organizationId String
  permissions    RolePermission[]
  memberships    Membership[]
  
  @@unique([organizationId, name])
}
```

#### RolePermission Model
Maps permissions to roles.

```prisma
model RolePermission {
  id        String   @id @default(cuid())
  roleId    String
  key       String
  value     Boolean  @default(true)
  
  @@unique([roleId, key])
}
```

### Permission Hierarchy

1. **Admin Override**: Users with `membershipRole = "ADMIN"` have ALL permissions
2. **Direct Permissions**: User-specific permissions (highest priority after admin)
3. **Role Permissions**: Inherited from assigned role
4. **Default Deny**: If no permission found, access is denied

## Available Permissions

### Ticket Permissions
- `ticket:create` - Create new tickets
- `ticket:read` - View tickets
- `ticket:update` - Edit ticket content
- `ticket:delete` - Delete tickets
- `ticket:update_status` - Change ticket status

### Comment Permissions
- `comment:create` - Add comments
- `comment:read` - View comments
- `comment:update` - Edit comments
- `comment:delete` - Delete comments

### Organization Permissions
- `organization:update` - Update organization details
- `organization:delete` - Delete organization
- `organization:manage_members` - Manage organization members

### Member Permissions
- `member:invite` - Invite new members
- `member:remove` - Remove members
- `member:update_role` - Change member roles
- `member:update_permissions` - Modify member permissions

## Usage Examples

### Server-Side Permission Checking

```typescript
import { hasPermission } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";

// Check single permission
const canDelete = await hasPermission(
  userId,
  organizationId,
  PERMISSIONS.TICKET_DELETE
);

if (!canDelete) {
  return toActionState("ERROR", "Not authorized");
}
```

### Check Multiple Permissions

```typescript
import { hasPermissions } from "@/features/permission/utils/has-permission";

const permissions = await hasPermissions(
  userId,
  organizationId,
  [PERMISSIONS.TICKET_DELETE, PERMISSIONS.TICKET_UPDATE]
);

if (permissions[PERMISSIONS.TICKET_DELETE]) {
  // User can delete tickets
}
```

### Get All User Permissions

```typescript
import { getUserPermissions } from "@/features/permission/utils/has-permission";

const userPermissions = await getUserPermissions(userId, organizationId);
// Returns: ["ticket:delete", "ticket:update", ...]
```

### Client-Side Permission Checking

```typescript
"use client";

import { usePermission } from "@/features/permission/hooks/use-permission";
import { PERMISSIONS } from "@/features/permission/constants";

function TicketActions({ userId, organizationId }) {
  const { data: canDelete, isLoading } = usePermission({
    userId,
    organizationId,
    permissionKey: PERMISSIONS.TICKET_DELETE,
  });

  if (isLoading) return <Spinner />;

  return (
    <>
      {canDelete && <DeleteButton />}
    </>
  );
}
```

### Setting Permissions (Server Actions)

```typescript
import { setPermission } from "@/features/permission/actions/manage-permissions";

const result = await setPermission({
  userId: "user-123",
  organizationId: "org-456",
  permissionKey: PERMISSIONS.TICKET_DELETE,
  value: true,
});
```

### Using the Permission Toggle Component

```tsx
import { PermissionToggle } from "@/features/permission/components/permission-toggle";
import { PERMISSIONS } from "@/features/permission/constants";

<PermissionToggle
  userId={userId}
  organizationId={organizationId}
  permissionKey={PERMISSIONS.TICKET_DELETE}
  hasPermission={canDelete}
  disabled={!isAdmin}
/>
```

### Display Permission List

```tsx
import { PermissionList } from "@/features/permission/components/permission-list";

// In a server component
<PermissionList
  userId={membership.userId}
  organizationId={membership.organizationId}
  isAdmin={membership.membershipRole === "ADMIN"}
  canManagePermissions={canManage}
/>
```

## Role Management

### Create a Role

```typescript
import { createRole } from "@/features/permission/actions/manage-permissions";
import { PERMISSIONS } from "@/features/permission/constants";

const result = await createRole({
  organizationId: "org-123",
  name: "Content Editor",
  description: "Can create and edit content",
  permissions: [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_UPDATE,
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
  roleId: "role-789",
});
```

### Default Role Templates

The system includes three predefined role templates:

**Admin** (Full Access)
- All permissions

**Editor** (Content Management)
- Create, read, update tickets
- Update ticket status
- Create, read, update comments

**Viewer** (Read-Only)
- Read tickets
- Read comments

## Adding New Permissions

To add a new permission to the system:

1. **Add to constants** (`src/features/permission/constants.ts`):

```typescript
export const PERMISSIONS = {
  // ... existing permissions
  TICKET_ASSIGN: "ticket:assign",
} as const;
```

2. **Add metadata**:

```typescript
export const PERMISSION_METADATA: Record<PermissionKey, {...}> = {
  // ... existing metadata
  [PERMISSIONS.TICKET_ASSIGN]: {
    label: "Assign Tickets",
    description: "Allows assigning tickets to users",
    category: "ticket",
  },
};
```

3. **Use in your code**:

```typescript
const canAssign = await hasPermission(
  userId,
  organizationId,
  PERMISSIONS.TICKET_ASSIGN
);
```

**That's it!** No database migration needed. The permission system is fully dynamic.

## Migration from Boolean Columns

### Legacy Support

The system maintains backward compatibility with the old `canDeleteTicket` boolean column:

```typescript
export const LEGACY_PERMISSION_MAP = {
  canDeleteTicket: PERMISSIONS.TICKET_DELETE,
} as const;
```

### Migration Strategy

1. **Keep both systems temporarily** - Boolean columns + new Permission table
2. **Gradually migrate features** - Update one feature at a time to use new system
3. **Deprecate old columns** - Once all features migrated, remove boolean columns

### Example Migration

**Before (Boolean Column)**:
```typescript
const membership = await prisma.membership.findUnique({
  where: { membershipId: { userId, organizationId } },
});

if (!membership.canDeleteTicket) {
  return error("Not authorized");
}
```

**After (New System)**:
```typescript
import { hasPermission } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";

const canDelete = await hasPermission(
  userId,
  organizationId,
  PERMISSIONS.TICKET_DELETE
);

if (!canDelete) {
  return error("Not authorized");
}
```

## Performance Considerations

### Caching
- Client-side queries cache for 5 minutes using React Query
- Server-side should implement caching strategy for high-traffic routes

### Optimization Tips
1. **Batch permission checks** - Use `hasPermissions()` instead of multiple `hasPermission()` calls
2. **Check admin first** - Admin check is fastest (single DB query)
3. **Index properly** - Ensure `userId`, `organizationId`, `key` are indexed

### Database Indexes

```prisma
@@index([userId])
@@index([organizationId])
@@index([key])
@@unique([userId, organizationId, key])
```

## Security Best Practices

1. **Always verify on server** - Client-side checks are for UX only
2. **Check permissions in actions** - Never trust client input
3. **Use getAdminOrRedirect** - For admin-only operations
4. **Validate organization context** - Ensure user belongs to org
5. **Audit trail** - `createdAt`/`updatedAt` track permission changes

## API Reference

### Utility Functions

- `hasPermission(userId, orgId, key)` - Check single permission
- `hasPermissions(userId, orgId, keys)` - Check multiple permissions
- `hasAnyPermission(userId, orgId, keys)` - Check if user has ANY permission
- `hasAllPermissions(userId, orgId, keys)` - Check if user has ALL permissions
- `getUserPermissions(userId, orgId)` - Get all user's permissions

### Server Actions

- `toggleUserPermission({ userId, orgId, key })` - Toggle a permission
- `setPermission({ userId, orgId, key, value })` - Set specific value
- `assignRole({ userId, orgId, roleId })` - Assign role to user
- `createRole({ orgId, name, description, permissions })` - Create new role
- `updateRolePermissions({ roleId, permissions })` - Update role
- `deleteRole(roleId)` - Delete a role

### Client Hooks

- `usePermission({ userId, orgId, permissionKey })` - Check single permission
- `usePermissions({ userId, orgId, permissionKeys })` - Check multiple permissions
- `useUserPermissions(userId, orgId)` - Get all permissions

## Troubleshooting

### Permission not working

1. Check if user is in organization
2. Verify permission key spelling
3. Check if admin override is affecting behavior
4. Review role assignment
5. Check database for permission record

### Performance issues

1. Add database indexes
2. Implement caching layer
3. Batch permission checks
4. Use `hasPermissions()` for multiple checks

## Future Enhancements

Potential additions to the system:

- [ ] Time-based permissions (expiration)
- [ ] Permission groups/categories in UI
- [ ] Permission inheritance (hierarchical roles)
- [ ] Audit log UI for permission changes
- [ ] Bulk permission updates
- [ ] Permission templates export/import
- [ ] Team-level permissions
- [ ] Conditional permissions (context-based)

---

**Last Updated**: 2024
**Version**: 1.0.0