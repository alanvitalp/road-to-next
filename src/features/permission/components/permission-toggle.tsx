"use client";

import { BanIcon,CheckIcon } from "lucide-react";
import { useActionState } from "react";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { toggleUserPermission } from "../actions/toggle-permission";
import type { PermissionKey } from "../constants";

type PermissionToggleProps = {
  userId: string;
  organizationId: string;
  permissionKey: PermissionKey;
  hasPermission: boolean;
  disabled?: boolean;
};

const PermissionToggle = ({
  userId,
  organizationId,
  permissionKey,
  hasPermission,
  disabled = false,
}: PermissionToggleProps) => {
  const [actionState, action] = useActionState(
    toggleUserPermission.bind(null, {
      userId,
      organizationId,
      permissionKey,
    }),
    EMPTY_ACTION_STATE,
  );

  if (disabled) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        {hasPermission ? (
          <CheckIcon className="w-4 h-4 text-muted-foreground" />
        ) : (
          <BanIcon className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton
        icon={hasPermission ? <CheckIcon /> : <BanIcon />}
        size="icon"
        variant={hasPermission ? "default" : "outline"}
      />
    </Form>
  );
};

export { PermissionToggle };
