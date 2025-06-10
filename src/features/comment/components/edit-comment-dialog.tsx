"use client" 

import { cloneElement, useState } from "react"
import { FieldError } from "@/components/form/field-error"
import { Form } from "@/components/form/form"
import { SubmitButton } from "@/components/form/submit-button"
import { ActionState } from "@/components/form/utils/to-action-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type UseConfirmDialogProps = {
  title?: string;
  description?: string;
  action: (payload: FormData) => void;
  trigger: React.ReactElement
  actionState: ActionState
}

const useEditCommentDialog = ({
  action,
  actionState,
  trigger, 
  title = "Edit comment",
  description = "Make changes to your comment here."
}: UseConfirmDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dialogTrigger = cloneElement(trigger, {
    onClick: () => setIsOpen(state => !state)
  })

  const handleSuccess= () => {
    setIsOpen(false)
  }

  const dialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <Textarea name="content" placeholder="What's on your mind ..." />
          <FieldError actionState={actionState} name="content" />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>

            <SubmitButton label="Save changes" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )

  return [dialogTrigger, dialog] as const;
}

export { useEditCommentDialog }
