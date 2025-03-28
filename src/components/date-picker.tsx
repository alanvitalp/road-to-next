"use client"

import { format } from "date-fns"
import {  LucideCalendar } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  id: string
  name: string
  defaultValue?: string | undefined
}

const DatePicker = ({ id, name, defaultValue }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(defaultValue ? new Date(defaultValue) : new Date())

  const formattedStringDate = date ? format(date, "yyyy-MM-dd") : ""

  return (
    <Popover>
      <PopoverTrigger className="w-full" id={id} asChild>
        <input type="hidden" name={name} value={formattedStringDate} />
        <Button
          variant={"outline"}
          className="justify-start font-normal text-left"
        >
          <LucideCalendar className="w-4 h-4 mr-2"/>
          {formattedStringDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
