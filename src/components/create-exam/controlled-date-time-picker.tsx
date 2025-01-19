"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
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
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";

/**
 * Örnek bileşen:
 * - "Select Date" butonu popover açar → Calendar
 * - "Select Time" butonu popover açar → TimePicker
 * - Mobilde de masaüstünde de aynı mantık: iki ayrı popover
 */
interface ControlledDateTimePickerProps {
  label: string;
  placeholderDate?: string;
  placeholderTime?: string;
  description?: string;
  className?: string;

  // Calendar'a paslanacak (selected, onSelect haricinde)
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
  placeholderDate = "Select start date",
  placeholderTime = "Select start time",
  calendarProps,
}: {
  control: ControllerProps<TFieldValues, TName>["control"];
  name: ControllerProps<TFieldValues, TName>["name"];
} & ControlledDateTimePickerProps) => {
  // Tek bir alanı yönetiyoruz (date + time).
  // Form'da "field.value" bir Date objesi şeklinde saklanıyor.
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Tarih + saat popoverlarını ayrı yönetiyoruz.
        const [dateOpen, setDateOpen] = React.useState(false);
        const [timeOpen, setTimeOpen] = React.useState(false);

        // Geçici değer tutmayıp, kullanıcı her seçtiğinde doğrudan field.value'yı güncelliyoruz.
        // (İsterseniz "tempValue" mantığı da ekleyebilirsiniz.)
        const handleDateChange = (newDate: Date | undefined) => {
          if (!newDate) return;
          // Saat/dakika field.value'dan koruyarak, sadece tarihi güncellemek isteriz:
          // Örnek: eğer field.value varsa saat/dakika sabit kalsın.
          const old = field.value ? new Date(field.value) : new Date();

          old.setFullYear(newDate.getFullYear());
          old.setMonth(newDate.getMonth());
          old.setDate(newDate.getDate());
          field.onChange(old);
        };

        const handleTimeChange = (newDate: Date | undefined) => {
          if (!newDate) return;
          // Tarih bilgisi field.value'dan korunsun, sadece saat/dakika güncellesin:
          const old = field.value ? new Date(field.value) : new Date();

          old.setHours(newDate.getHours());
          old.setMinutes(newDate.getMinutes());
          field.onChange(old);
        };

        // Buton üstünde gösterilecek metin:
        const dateString = field.value ? format(field.value, "MM/dd/yyyy") : "";
        const timeString = field.value ? format(field.value, "hh:mm a") : "";

        return (
          <FormItem className={cn("w-full", className)}>
            <FormLabel className="mb-1 text-left">{label}</FormLabel>

            {/* Ekranda iki buton: Select Date, Select Time */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Date Popover */}
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="date-picker"
                      size="date-picker"
                      className={cn(
                        "w-full flex items-center justify-between gap-2",
                        "rounded-2xl border border-input bg-background text-md font-light",
                        "focus:outline-none focus:ring-2 focus:ring-brand-primary-800 focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        !field.value && "text-greyscale-light-900"
                      )}
                    >
                      {dateString ? <span>{dateString}</span> : <span>{placeholderDate}</span>}
                      <CalendarIcon className="h-5 w-5 shrink-0 text-greyscale-light-900" />
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={false}
                  className={cn(
                    "w-full max-h-[80vh] overflow-y-auto",
                    "bg-base-white border border-greyscale-light-200 rounded-2xl shadow-md p-4",
                    "flex flex-col gap-4"
                  )}
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(day) => {
                      // day = null ise => iptal demek
                      if (!day) return;
                      handleDateChange(day);
                      setDateOpen(false); // otomatik kapatmak isterseniz
                    }}
                    initialFocus
                    {...calendarProps}
                  />
                </PopoverContent>
              </Popover>

              {/* Time Popover */}
              <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="date-picker"
                      size="date-picker"
                      className={cn(
                        "flex w-full items-center justify-between gap-2",
                        "rounded-2xl border border-input bg-background text-md font-light",
                        "focus:outline-none focus:ring-2 focus:ring-brand-primary-800 focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        !field.value && "text-greyscale-light-900"
                      )}
                    >
                      {timeString ? <span>{timeString}</span> : <span>{placeholderTime}</span>}
                      <ClockIcon className="h-5 w-5 shrink-0 text-greyscale-light-900" />
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={false}
                  className={cn(
                    "w-[95vw] md:w-auto max-h-[80vh] overflow-y-auto",
                    "bg-base-white border border-greyscale-light-200 rounded-2xl shadow-md p-4",
                    "flex flex-col gap-4"
                  )}
                >
                  {/* TimePicker doğrudan field.value üzerinden çalışacak */}
                  <TimePicker date={field.value} setDate={handleTimeChange} />
                </PopoverContent>
              </Popover>
            </div>

            {description && <FormDescription className="mt-1">{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
