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
import { createRole } from "../actions/create-role";
import {
  DEFAULT_ROLES,
  PERMISSION_METADATA,
  type PermissionKey,
} from "../constants";

type CreateRoleFormProps = {
  organizationId: string;
};

const CreateRoleForm = ({ organizationId }: CreateRoleFormProps) => {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<
    Set<PermissionKey>
  >(new Set());

  const [actionState, action] = useActionState(
    createRole.bind(null, organizationId),
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

  const applyTemplate = (template: keyof typeof DEFAULT_ROLES) => {
    setSelectedPermissions(new Set(DEFAULT_ROLES[template].permissions));
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
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Content Editor"
              required
            />
            <FieldError actionState={actionState} name="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this role can do..."
              rows={3}
            />
            <FieldError actionState={actionState} name="description" />
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="flex gap-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyTemplate("ADMIN")}
            >
              Admin (All)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyTemplate("EDITOR")}
            >
              Editor
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyTemplate("VIEWER")}
            >
              Viewer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedPermissions(new Set())}
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
          <SubmitButton label="Create Role" />
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </Form>
  );
};

export { CreateRoleForm };
