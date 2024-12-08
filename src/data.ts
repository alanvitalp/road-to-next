export const initialTickets = [
  {
    id: "1",
    title: "ticket 1",
    content: "This is the first ticket",
    status: "DONE" as const
  },
  {
    id: "2",
    title: "ticket 2",
    content: "This is the second ticket.",
    status: "OPEN" as const
  },
  {
    id: "3",
    title: "ticket 3",
    content: "This is the third ticket.",
    status: "IN_PROGRESS" as const
  },
]