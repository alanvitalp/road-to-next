import { useEffect, useRef } from "react";
import { ActionState } from "../utils/to-action-state";

type onArgs = { actionState: ActionState };

type UseActionFeedbackOptions = {
  onSuccess?: (onArgs: onArgs) => void;
  onError?: (onArgs: onArgs) => void;
};

const useActionFeedback = (
  actionState: ActionState | undefined,
  options: UseActionFeedbackOptions,
) => {
  const prevTimestamp = useRef(actionState?.timestamp);
  const isUpdate = prevTimestamp.current !== actionState?.timestamp;

  useEffect(() => {
    if (!isUpdate) return;
    if (!actionState) return;

    if (actionState.status === "SUCCESS") {
      options.onSuccess?.({ actionState });
    }

    if (actionState.status === "ERROR") {
      options.onError?.({ actionState });
    }

    prevTimestamp.current = actionState.timestamp;
  }, [actionState, isUpdate, options]);
};

export { useActionFeedback };
