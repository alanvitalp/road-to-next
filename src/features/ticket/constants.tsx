import { LucideCheckCircle, LucideFileText, LucidePencil } from "lucide-react";

export const TICKET_ICONS = {
  OPEN: <LucideFileText />,
  IN_PROGRESS: <LucidePencil />,
  DONE: <LucideCheckCircle />
}

export const TICKET_STATUS_LABELS= {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
}