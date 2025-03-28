"use client"

import { format } from "date-fns"
import {  LucideCalendar } from "lucide-react"
import React, { useImperativeHandle, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ImperativeHandleFromDatePicker = {
  reset: () => void
}

type DatePickerProps = {
  id: string
  name: string
  defaultValue?: string | undefined
  imperativeHandleRef: React.RefObject<ImperativeHandleFromDatePicker>
}

const DatePicker = ({ id, name, defaultValue, imperativeHandleRef }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(defaultValue ? new Date(defaultValue) : new Date())

  const formattedStringDate = date ? format(date, "yyyy-MM-dd") : "";

  useImperativeHandle(imperativeHandleRef, () => ({
    reset: () => setDate(new Date())
  }))

  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full" id={id} asChild>
        <Button
          variant={"outline"}
          className="justify-start font-normal text-left"
        >
          <LucideCalendar className="w-4 h-4 mr-2" />
          {formattedStringDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
      <input type="hidden" name={name} value={formattedStringDate} />
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
