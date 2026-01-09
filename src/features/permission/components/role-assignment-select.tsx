"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Form } from "@/components/form/form";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignRole } from "../actions/assign-role";

type RoleAssignmentSelectProps = {
  userId: string;
  organizationId: string;
  currentRoleId: string | null;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  disabled?: boolean;
};

const RoleAssignmentSelect = ({
  userId,
  organizationId,
  currentRoleId,
  roles,
  disabled = false,
}: RoleAssignmentSelectProps) => {
  const [actionState, action, isPending] = useActionState(
    async (_prevState: typeof EMPTY_ACTION_STATE, formData: FormData) => {
      const roleId = formData.get("roleId") as string | null;
      return assignRole({
        userId,
        organizationId,
        roleId: roleId === "none" ? null : roleId,
      });
    },
    EMPTY_ACTION_STATE,
  );

  useEffect(() => {
    if (actionState.status === "SUCCESS") {
      toast.success(actionState.message);
    } else if (actionState.status === "ERROR") {
      toast.error(actionState.message);
    }
  }, [actionState]);

  const handleRoleChange = (value: string) => {
    const formData = new FormData();
    formData.append("roleId", value);
    action(formData);
  };

  return (
    <Form action={action} actionState={actionState}>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={currentRoleId || "none"}
          onValueChange={handleRoleChange}
          disabled={disabled || isPending}
          name="roleId"
        >
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Role</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{role.name}</span>
                  {role.description && (
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentRoleId && (
          <p className="text-xs text-muted-foreground">
            Role permissions are inherited. Direct permissions override role
            permissions.
          </p>
        )}
        {isPending && (
          <p className="text-xs text-muted-foreground">Updating role...</p>
        )}
      </div>
    </Form>
  );
};

export { RoleAssignmentSelect };
