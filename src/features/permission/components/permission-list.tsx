import { PERMISSION_METADATA, type PermissionKey } from "../constants";
import { getUserPermissions } from "../utils/has-permission";
import { PermissionToggle } from "./permission-toggle";

type PermissionListProps = {
  userId: string;
  organizationId: string;
  canManagePermissions: boolean;
};

const PermissionList = async ({
  userId,
  organizationId,
  canManagePermissions,
}: PermissionListProps) => {
  const userPermissions = await getUserPermissions(userId, organizationId);
  const permissionSet = new Set(userPermissions);

  // Group permissions by category
  const groupedPermissions = Object.entries(PERMISSION_METADATA).reduce(
    (acc, [key, metadata]) => {
      if (!acc[metadata.category]) {
        acc[metadata.category] = [];
      }
      acc[metadata.category].push({
        key: key as PermissionKey,
        ...metadata,
      });
      return acc;
    },
    {} as Record<
      string,
      Array<{
        key: PermissionKey;
        label: string;
        description: string;
        category: string;
      }>
    >,
  );

  const categoryLabels = {
    ticket: "Ticket Permissions",
    comment: "Comment Permissions",
    organization: "Organization Permissions",
    member: "Member Permissions",
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([category, permissions]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-semibold">
            {categoryLabels[category as keyof typeof categoryLabels] ||
              category}
          </h3>
          <div className="space-y-2">
            {permissions.map((permission) => {
              const hasPermission = permissionSet.has(permission.key);

              return (
                <div
                  key={permission.key}
                  className="flex items-center justify-between gap-x-4 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{permission.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                  <PermissionToggle
                    userId={userId}
                    organizationId={organizationId}
                    permissionKey={permission.key}
                    hasPermission={hasPermission}
                    disabled={!canManagePermissions}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export { PermissionList };
