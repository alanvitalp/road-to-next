"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateRole } from "../actions/update-role";
import { PERMISSION_METADATA, type PermissionKey } from "../constants";

type EditRoleFormProps = {
  organizationId: string;
  role: {
    id: string;
    name: string;
    description: string | null;
    permissions: Array<{
      id: string;
      key: string;
      value: boolean;
    }>;
  };
};

const EditRoleForm = ({ organizationId, role }: EditRoleFormProps) => {
  const router = useRouter();

  // Initialize with current role permissions
  const initialPermissions = new Set(
    role.permissions.filter((p) => p.value).map((p) => p.key as PermissionKey),
  );

  const [selectedPermissions, setSelectedPermissions] =
    useState<Set<PermissionKey>>(initialPermissions);

  const [actionState, action] = useActionState(
    updateRole.bind(null, role.id, organizationId),
    EMPTY_ACTION_STATE,
  );

  const togglePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPermissions(
      new Set(Object.keys(PERMISSION_METADATA) as PermissionKey[]),
    );
  };

  const clearAll = () => {
    setSelectedPermissions(new Set());
  };

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

  if (actionState.status === "SUCCESS") {
    toast.success(actionState.message);
    router.refresh();
  }

  return (
    <Form action={action} actionState={actionState}>
      <div className="space-y-6">
        {/* Basic Info (Read-only) */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              name="name"
              value={role.name}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Role name cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={role.description || ""}
              disabled
              className="bg-muted"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Description cannot be changed (edit functionality coming soon)
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="flex gap-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Hidden input to send permissions */}
        <input
          type="hidden"
          name="permissions"
          value={Array.from(selectedPermissions).join(",")}
        />

        {/* Permissions */}
        <div className="space-y-4">
          <Label>Permissions ({selectedPermissions.size} selected)</Label>
          <FieldError actionState={actionState} name="permissions" />

          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold">
                {categoryLabels[category as keyof typeof categoryLabels] ||
                  category}
              </h4>
              <div className="space-y-1">
                {permissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-start gap-x-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.key)}
                      onChange={() => togglePermission(permission.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{permission.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-x-2">
          <SubmitButton label="Update Permissions" />
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </Form>
  );
};

export { EditRoleForm };
