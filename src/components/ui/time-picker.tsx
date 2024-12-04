"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { TimePickerInput } from "./time-picker-input";
import { TimePeriodSelect } from "./time-period-select";
import { Period } from "./time-picker-utils";
import { ClockIcon } from "@heroicons/react/24/outline";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const [period, setPeriod] = React.useState<Period>(
    date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM"
  );

  React.useEffect(() => {
    if (date) {
      setPeriod(date.getHours() >= 12 ? "PM" : "AM");
    }
  }, [date]);

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center gap-4 justify-between">
      <div className="flex">
        <div className="grid gap-1 text-center cursor-pointer">
          <Label htmlFor="hours" className="text-book text-xs">
            Hours
          </Label>
          <TimePickerInput
            className="rounded-r-none"
            picker="12hours"
            period={period}
            date={date}
            setDate={setDate}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
        </div>
        <div className="grid gap-1 text-center cursor-pointer">
          <Label htmlFor="minutes" className="text-book text-xs">
            Mins
          </Label>
          <TimePickerInput
            className="rounded-l-none"
            picker="minutes"
            id="minutes"
            date={date}
            setDate={setDate}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onRightFocus={() => periodRef.current?.focus()}
          />
        </div>
      </div>
      <div className="grid gap-1 text-center cursor-pointer rounded-none">
        <Label htmlFor="period" className="text-xs text-book w-full h-full">
          Select period
        </Label>
        <TimePeriodSelect
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          ref={periodRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
      </div>
    </div>
  );
}
