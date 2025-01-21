"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "@heroicons/react/24/outline";
// Yukarıdaki "TimePicker" (only custom hours/minutes, select AM/PM)
import { TimePicker } from "@/components/ui/time-picker";

interface TimePopoverProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

// Basit “Select time” butonu, tıklayınca popover açılır;
// popover içinde custom “TimePicker” (hours/minutes input + AM/PM select).
export function TimePopover({ date, setDate }: TimePopoverProps) {
  const [open, setOpen] = React.useState(false);

  // Buton üstü format
  function formatTime(d?: Date): string {
    if (!d) return "Select time";
    const hh = (d.getHours() % 12) || 12;
    const mm = d.getMinutes().toString().padStart(2, "0");
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    return `${hh}:${mm} ${ampm}`;
  }

  return (
    <div className="flex flex-col items-start">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            {formatTime(date)}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-4 bg-white border border-gray-200 rounded shadow"
          side="bottom"
          align="center"
          sideOffset={8}
          // Dışarı tıklamayla kapanmasın istiyorsanız:
          // onInteractOutside={(e) => e.preventDefault()}
        >
          <TimePicker date={date} setDate={setDate} />
          <div className="flex justify-end mt-2">
            <Button variant="default" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
