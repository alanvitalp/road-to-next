"use client";

import {
  cloneElement,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useActionFeedback } from "@/components/form/hooks/use-action-feedback";
import {
  type ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type UseConfirmDialogProps = {
  title?: string;
  description?: string;
  action: () => Promise<ActionState>;
  trigger: React.ReactElement | ((isLoading: boolean) => React.ReactElement);
  onSuccess?: (actionState: ActionState) => void;
  loadingMessage?: string;
};

const useConfirmDialog = ({
  action,
  trigger,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. Make sure you understand the consequences.",
  onSuccess,
  loadingMessage = "Deleting ...",
}: UseConfirmDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [actionState, formAction, isPending] = useActionState(
    action,
    EMPTY_ACTION_STATE,
  );

  const dialogTrigger = cloneElement(
    typeof trigger === "function" ? trigger(isPending) : trigger,
    {
      onClick: () => setIsOpen((state) => !state),
    },
  );

  const toastRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (isPending) {
      toastRef.current = toast.loading(loadingMessage);
    } else if (toastRef.current) {
      toast.dismiss(toastRef.current);
    }

    return () => {
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }
    };
  }, [isPending, loadingMessage]);

  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message);
      }

      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message) {
        toast.error(actionState.message);
      }
    },
  });

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <form action={formAction}>
              <Button type="submit">Confirm</Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [dialogTrigger, dialog] as const;
};

export { useConfirmDialog };
