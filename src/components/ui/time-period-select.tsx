"use client";

import * as React from "react";
import { Period, display12HourValue, setDateByType } from "./time-picker-utils";
import { ButtonGroup } from "./button-group";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface PeriodSelectorProps {
  period: Period;
  setPeriod: (m: Period) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

export const TimePeriodSelect = React.forwardRef<HTMLButtonElement, PeriodSelectorProps>(
  ({ period, setPeriod, date, setDate, onLeftFocus }, ref) => {
    const handleValueChange = (value: Period) => {
      setPeriod(value);

      /**
       * trigger an update whenever the user switches between AM and PM;
       * otherwise user must manually change the hour each time
       */
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        setDate(
          setDateByType(tempDate, hours.toString(), "12hours", period === "AM" ? "PM" : "AM")
        );
      }
    };

    const pmRef = React.useRef<HTMLButtonElement>(null);

    return (
      <ButtonGroup>
        <Button
          ref={ref}
          size="date"
          onClick={() => handleValueChange("AM")}
          className={cn(period === "PM" && "bg-transparent [&:not(:hover)]:text-accent-foreground")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") pmRef.current?.focus();
            if (e.key === "ArrowLeft" && onLeftFocus) onLeftFocus();
          }}
        >
          AM
        </Button>
        <Button
          ref={pmRef}
          size="date"
          onClick={() => handleValueChange("PM")}
          className={cn(period === "AM" && "bg-transparent [&:not(:hover)]:text-accent-foreground")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" && ref && "current" in ref) ref.current?.focus();
          }}
        >
          PM
        </Button>
      </ButtonGroup>
    );
  }
);

TimePeriodSelect.displayName = "TimePeriodSelect";
