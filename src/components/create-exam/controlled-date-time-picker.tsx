import React from "react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@heroicons/react/24/outline";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface ControlledDateTimePickerProps {
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    "selected" | "onSelect" | "mode" | "initialFocus"
  >;
}

export const ControlledDateTimePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  className,
  description,
  placeholder,
  calendarProps,
}: {
  control: ControllerProps<TFieldValues, TName>["control"];
  name: ControllerProps<TFieldValues, TName>["name"];
} & ControlledDateTimePickerProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <FormLabel className="text-left">{label}</FormLabel>
          <Popover>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="date-picker"
                  size="date-picker"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-2xl border border-input bg-background text-md font-light focus:outline-none focus:ring-2 focus:ring-brand-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !field.value && "text-greyscale-light-400"
                  )}
                >
                  {field.value ? (
                    format(field.value, "MM/dd/yyyy hh:mm a")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent className="bg-base-white w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
                {...calendarProps}
              />
              <div className="pt-3 pb-3 border-t border-border flex justify-between">
                <TimePicker setDate={field.onChange} date={field.value} />
              </div>
            </PopoverContent>
          </Popover>

          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
