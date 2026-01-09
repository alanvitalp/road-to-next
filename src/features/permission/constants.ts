/**
 * Permission Registry
 *
 * This file contains all available permissions in the system.
 * Add new permissions here to make them available across the application.
 */

export const PERMISSIONS = {
  // Ticket Permissions
  TICKET_CREATE: "ticket:create",
  TICKET_READ: "ticket:read",
  TICKET_UPDATE: "ticket:update",
  TICKET_DELETE: "ticket:delete",
  TICKET_UPDATE_STATUS: "ticket:update_status",

  // Comment Permissions
  COMMENT_CREATE: "comment:create",
  COMMENT_READ: "comment:read",
  COMMENT_UPDATE: "comment:update",
  COMMENT_DELETE: "comment:delete",

  // Organization Permissions
  ORGANIZATION_UPDATE: "organization:update",
  ORGANIZATION_DELETE: "organization:delete",
  ORGANIZATION_MANAGE_MEMBERS: "organization:manage_members",

  // Member Permissions
  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",
  MEMBER_UPDATE_ROLE: "member:update_role",
  MEMBER_UPDATE_PERMISSIONS: "member:update_permissions",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Minimum Required Permissions
 * Every member MUST have these permissions to use the app
 */
export const MINIMUM_REQUIRED_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.TICKET_READ,
  PERMISSIONS.COMMENT_READ,
];

/**
 * Permission metadata for UI display and organization
 */
export const PERMISSION_METADATA: Record<
  PermissionKey,
  {
    label: string;
    description: string;
    category: "ticket" | "comment" | "organization" | "member";
  }
> = {
  [PERMISSIONS.TICKET_CREATE]: {
    label: "Create Tickets",
    description: "Allows creating new tickets",
    category: "ticket",
  },
  [PERMISSIONS.TICKET_READ]: {
    label: "View Tickets",
    description: "Allows viewing tickets",
    category: "ticket",
  },
  [PERMISSIONS.TICKET_UPDATE]: {
    label: "Edit Tickets",
    description: "Allows editing ticket content",
    category: "ticket",
  },
  [PERMISSIONS.TICKET_DELETE]: {
    label: "Delete Tickets",
    description: "Allows deleting tickets",
    category: "ticket",
  },
  [PERMISSIONS.TICKET_UPDATE_STATUS]: {
    label: "Update Ticket Status",
    description: "Allows changing ticket status",
    category: "ticket",
  },
  [PERMISSIONS.COMMENT_CREATE]: {
    label: "Create Comments",
    description: "Allows adding comments to tickets",
    category: "comment",
  },
  [PERMISSIONS.COMMENT_READ]: {
    label: "View Comments",
    description: "Allows viewing comments",
    category: "comment",
  },
  [PERMISSIONS.COMMENT_UPDATE]: {
    label: "Edit Comments",
    description: "Allows editing comment content",
    category: "comment",
  },
  [PERMISSIONS.COMMENT_DELETE]: {
    label: "Delete Comments",
    description: "Allows deleting comments",
    category: "comment",
  },
  [PERMISSIONS.ORGANIZATION_UPDATE]: {
    label: "Edit Organization",
    description: "Allows updating organization details",
    category: "organization",
  },
  [PERMISSIONS.ORGANIZATION_DELETE]: {
    label: "Delete Organization",
    description: "Allows deleting the organization",
    category: "organization",
  },
  [PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS]: {
    label: "Manage Members",
    description: "Allows managing organization members",
    category: "organization",
  },
  [PERMISSIONS.MEMBER_INVITE]: {
    label: "Invite Members",
    description: "Allows inviting new members",
    category: "member",
  },
  [PERMISSIONS.MEMBER_REMOVE]: {
    label: "Remove Members",
    description: "Allows removing members from organization",
    category: "member",
  },
  [PERMISSIONS.MEMBER_UPDATE_ROLE]: {
    label: "Update Member Roles",
    description: "Allows changing member roles",
    category: "member",
  },
  [PERMISSIONS.MEMBER_UPDATE_PERMISSIONS]: {
    label: "Update Member Permissions",
    description: "Allows modifying member permissions",
    category: "member",
  },
};

/**
 * Default role templates with predefined permissions
 * These should be created for each organization on setup
 */
export const DEFAULT_ROLES = {
  ADMIN: {
    name: "Admin",
    description: "Full access to all features",
    permissions: Object.values(PERMISSIONS),
  },
  MEMBER: {
    name: "Member",
    description: "Basic member with read and create access",
    permissions: [
      PERMISSIONS.TICKET_READ,
      PERMISSIONS.TICKET_CREATE,
      PERMISSIONS.COMMENT_READ,
      PERMISSIONS.COMMENT_CREATE,
    ],
  },
  EDITOR: {
    name: "Editor",
    description: "Can create and edit content",
    permissions: [
      PERMISSIONS.TICKET_CREATE,
      PERMISSIONS.TICKET_READ,
      PERMISSIONS.TICKET_UPDATE,
      PERMISSIONS.TICKET_UPDATE_STATUS,
      PERMISSIONS.COMMENT_CREATE,
      PERMISSIONS.COMMENT_READ,
      PERMISSIONS.COMMENT_UPDATE,
    ],
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access",
    permissions: [PERMISSIONS.TICKET_READ, PERMISSIONS.COMMENT_READ],
  },
} as const;

/**
 * Legacy permission mapping
 * Maps old boolean column names to new permission keys
 */
export const LEGACY_PERMISSION_MAP = {
  canDeleteTicket: PERMISSIONS.TICKET_DELETE,
} as const;
