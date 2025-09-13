"use client"

import { cloneElement, useActionState, useState } from "react";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { ActionState, EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type UseConfirmDialogProps = {
  title?: string;
  description?: string;
  action: () => Promise<ActionState>;
  trigger: React.ReactElement
  onSuccess?: (actionState: ActionState) => void;
}

const useConfirmDialog = ({
  action, 
  trigger, 
  title = "Are you absolutely sure?", 
  description = "This action cannot be undone. Make sure you understand the consequences.",
  onSuccess,
}: UseConfirmDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dialogTrigger = cloneElement(trigger, {
    onClick: () => setIsOpen(state => !state)
  })

  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  const handleSuccess= () => {
    setIsOpen(false)
    onSuccess?.(actionState);
  }

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Form action={formAction} actionState={actionState} onSuccess={handleSuccess}>
              <SubmitButton label="Confirm" />
            </Form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return [dialogTrigger, dialog] as const;
}

export { useConfirmDialog }