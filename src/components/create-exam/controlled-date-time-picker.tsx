"use client";

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
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";

interface ControlledDateTimePickerProps {
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
  // Calendar bileşenine iletilecek diğer prop'lar (selected, onSelect, vs. hariç)
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    "selected" | "onSelect" | "mode" | "initialFocus"
  >;
}

/**
 * Tek popover içinde: Takvim + Saat seçimi + OK/CANCEL butonları
 * - Her zaman altta (bottom)
 * - Popover genişliği butonun genişliğine eşit (min-w-full)
 * - Takvimde seçili günü vurgulamak için 'tempValue' state kullanıyoruz.
 */
export const ControlledDateTimePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  className,
  description,
  placeholder = "Select date & time",
  calendarProps,
}: {
  control: ControllerProps<TFieldValues, TName>["control"];
  name: ControllerProps<TFieldValues, TName>["name"];
} & ControlledDateTimePickerProps) => {
  // Popover açılıp/kapanma durumu
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Takvimde tıklanan değeri anlık tutan state. "OK" diyene kadar field.value'ya geçmez.
        const [tempValue, setTempValue] = React.useState<Date | undefined>(
          field.value
        );

        // Popover açılınca, tempValue = field.value (Form'un asıl değeri)
        React.useEffect(() => {
          if (open) {
            setTempValue(field.value);
          }
        }, [open, field.value]);

        // Takvim veya saat seçilince bu state güncelleniyor
        const handleChange = (val: Date | undefined) => {
          setTempValue(val);
        };

        // Kullanıcı "Cancel" derse, değişiklikleri iptal edip popover'ı kapatırız
        const handleCancel = () => {
          setTempValue(field.value);
          setOpen(false);
        };

        // Kullanıcı "OK" derse, formun asıl değerini (field.value) güncelleriz
        const handleOk = () => {
          field.onChange(tempValue);
          setOpen(false);
        };

        return (
          <FormItem className={cn("w-full", className)}>
            <FormLabel className="mb-1 text-left">{label}</FormLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant="date-picker"
                    size="date-picker"
                    className={cn(
                      "flex w-full items-center justify-between gap-2",
                      "rounded-2xl border border-input bg-background text-md font-light",
                      "focus:outline-none focus:ring-2 focus:ring-brand-primary-400 focus:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      !field.value && "text-greyscale-light-900"
                    )}
                  >
                    {/* Buton üstünde seçili değeri gösteriyoruz */}
                    {field.value ? (
                      <span>{format(field.value, "MM/dd/yyyy hh:mm a")}</span>
                    ) : (
                      <span>{placeholder}</span>
                    )}
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
                  "min-w-full w-auto bg-base-white border border-greyscale-light-200",
                  "rounded-2xl shadow-md p-4 flex flex-col gap-4 max-h-[80vh]"
                )}
              >
                {/* Küçük bir uyarı veya açıklama */}
                <div className="text-sm text-ui-error-600 leading-5">
                  <strong>🚨</strong> This is the date/time when your live quiz will begin!
                </div>

                {/* Takvim + Saat seçiciler */}
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                  <div className="flex-1">
                    <Calendar
                      // Takvimde seçili günü vurgulamak için
                      mode="single"
                      selected={tempValue}
                      onSelect={(day) => handleChange(day ?? undefined)}
                      initialFocus
                      {...calendarProps}
                    />
                  </div>
                  <div className="flex-1 pt-3 border-t border-greyscale-light-200 md:pt-0 md:border-t-0 md:border-l md:pl-6">
                    <TimePicker date={tempValue} setDate={handleChange} />
                  </div>
                </div>

                {/* Alt butonlar */}
                <div className="flex justify-end gap-3 border-t border-greyscale-light-200 pt-3">
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="default" onClick={handleOk}>
                    OK
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Opsiyonel açıklama vs. */}
            {description && (
              <FormDescription className="mt-1">{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
