"use client";

import * as React from "react";
import {
  DayPicker,
  DayPickerSingleProps,
  SelectSingleEventHandler,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export type CalendarProps = DayPickerSingleProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onSelect,
  // Varsayılan tekil seçim
  mode = "single",
  // Takvimde seçili gün için
  selected,
  ...props
}: CalendarProps) {
  /**
   * Kullanıcı bir güne tıkladığında çağrılan fonksiyon.
   * Burada 'bugün'e tıklarsa '5 dk sonrası' mantığını koruyoruz.
   */
  const handleDaySelect: SelectSingleEventHandler = (
    day,
    selectedDay,
    activeModifiers,
    e
  ) => {
    // Eğer bugüne tıklanırsa, 5 dk sonrasını seç
    if (day?.toDateString() === new Date().toDateString()) {
      onSelect?.(
        new Date(Date.now() + 5 * 60 * 1000),
        selectedDay,
        activeModifiers,
        e
      );
      return;
    }
    onSelect?.(day, selectedDay, activeModifiers, e);
  };

  return (
    <DayPicker
      mode={mode}
      selected={selected}
      showOutsideDays={showOutsideDays}
      // Seçileni güncelleme fonksiyonunu daypicker'a paslıyoruz
      onSelect={handleDaySelect}
      className={cn("w-auto", className)}
      classNames={{
        // --- Takvim ayları layout ---
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",

        // --- Takvim başlığı ---
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",

        // --- Gezinti butonları (Ay ileri/geri) ---
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 border border-brand-primary-950 hover:bg-brand-primary-200 hover:border-brand-primary-800"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next:
          "absolute right-1 hover:bg-brand-primary-200 hover:border-brand-primary-800 hover:text-brand-primary-950",

        // --- Tablo yapısı ---
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-greyscale-light-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),

        // --- Gün stilleri (normal + hover) ---
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-regular aria-selected:opacity-100 transition-colors",
          "hover:bg-greyscale-light-200 hover:text-brand-primary-950"
        ),

        // Seçili gün stili (Arka plan & yazı rengi)
        day_selected: cn(
          "bg-brand-primary-200 font-bold text-brand-primary-950",  // Projenizde tanımlı bir renk olmalı
          "hover:bg-primary hover:text-primary-foreground", 
          "focus:bg-primary focus:text-primary-foreground"
        ),

        // Bugün
        day_today: "bg-accent text-accent-foreground",

        // Dışarıdaki günler (önceki/sonraki ay)
        day_outside:
          "text-greyscale-light-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-greyscale-light-400 aria-selected:opacity-30",

        // Devre dışı gün
        day_disabled: "text-greyscale-light-400 opacity-50",

        // Range ortasındaki günler
        day_range_end: "day-range-end",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        day_hidden: "invisible",

        // Ek classNames (üst bileşenler override edebilir)
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeftIcon className="h-4 w-4 stroke-2" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRightIcon className="h-4 w-4 stroke-2" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
