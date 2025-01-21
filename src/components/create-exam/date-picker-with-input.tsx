"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";

export function DatePickerWithInput() {
  // Seçili tarihi state'te tutuyoruz
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();

  // Takvimden gelen tarihi burada alıyoruz
  function handleSelect(date: Date | undefined) {
    setSelectedDate(date);
  }

  return (
    <div className="flex flex-col gap-4">
      <Calendar selected={selectedDate} onSelect={handleSelect} mode={"single"} />
      <input
        type="text"
        className="border px-2 py-1 rounded"
        readOnly
        value={selectedDate ? selectedDate.toLocaleDateString("en-US") : ""}
        placeholder="Select a date from calendar"
      />
    </div>
  );
}
