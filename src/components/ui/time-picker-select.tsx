"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// AM/PM tip tanımı
type Period = "AM" | "PM";

interface TimePickerSelectProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

/**
 * Basit bir Select tabanlı 12 saat formatı TimePicker.
 * Saat, dakika, AM/PM’yi dropdown menülerle seçtirir.
 */
export function TimePickerSelect({ date, setDate }: TimePickerSelectProps) {
  // AM/PM belirle
  const [period, setPeriod] = React.useState<Period>(
    date && date.getHours() >= 12 ? "PM" : "AM"
  );

  // Saat ve dakika (string)
  const [hours, setHours] = React.useState("12");   // "1"–"12"
  const [minutes, setMinutes] = React.useState("00"); // "00"–"59"

  // date değişince senkronize et
  React.useEffect(() => {
    if (!date) {
      setHours("12");
      setMinutes("00");
      setPeriod("AM");
      return;
    }
    const h12 = (date.getHours() % 12) || 12; 
    setHours(h12.toString());
    setMinutes(date.getMinutes().toString().padStart(2, "0"));
    setPeriod(date.getHours() >= 12 ? "PM" : "AM");
  }, [date]);

  // Saat/dakika/AM-PM değişince date’i güncelle
  const updateDate = (newHours: string, newMinutes: string, newPeriod: Period) => {
    const base = date ? new Date(date) : new Date();
    const final = new Date(base);

    let h = parseInt(newHours, 10) % 12; // 0–11
    if (newPeriod === "PM") {
      h += 12; // 12–23
    }
    const m = parseInt(newMinutes, 10) || 0; // 0–59

    final.setHours(h, m, 0, 0);
    setDate(final);
  };

  const handleHoursChange = (val: string) => {
    setHours(val);
    updateDate(val, minutes, period);
  };

  const handleMinutesChange = (val: string) => {
    setMinutes(val);
    updateDate(hours, val, period);
  };

  const handlePeriodChange = (val: Period) => {
    setPeriod(val);
    updateDate(hours, minutes, val);
  };

  // Saat seçenekleri (1..12)
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    i === 0 ? 12 : i
  );
  // Dakika seçenekleri (00..59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className="flex flex-row gap-4">
      {/* Hours */}
      <div className="flex flex-col">
        <Label className="text-xs font-medium mb-1">Hours</Label>
        <Select value={hours} onValueChange={handleHoursChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((num) => {
              const str = num.toString();
              return (
                <SelectItem key={str} value={str}>
                  {str}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Minutes */}
      <div className="flex flex-col">
        <Label className="text-xs font-medium mb-1">Minutes</Label>
        <Select value={minutes} onValueChange={handleMinutesChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AM/PM */}
      <div className="flex flex-col">
        <Label className="text-xs font-medium mb-1">AM/PM</Label>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
