import { ZodError } from "zod"

export type ActionState = { 
  message: string, 
  payload?: FormData, 
  fieldErrors: Record<string, string[] | undefined> 
  status?: 'SUCCESS' | "ERROR"
  timestamp: number;
}

export const EMPTY_ACTION_STATE: ActionState = {
  message: "",
  fieldErrors: {},
  timestamp: Date.now()
}

export const fromErrorToActionState = (error: unknown, formData?: FormData): ActionState => {
  if (error instanceof ZodError) {
    return {
      status: "ERROR",
      message: "",
      fieldErrors: error.flatten().fieldErrors,
      payload: formData,
      timestamp: Date.now()
    }
  } else if (error instanceof Error) {
    return {
      status: "ERROR",
      message: error.message,
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now()
    }
  } else {
    return {
      status: "ERROR",
      message: "An unknown error occurred", 
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now()
    }
  }
}

export const toActionState = (status: ActionState['status'], message: string): ActionState => {
  return { message, fieldErrors: {}, status, timestamp: Date.now() }
}