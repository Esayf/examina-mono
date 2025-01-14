"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Örnek zaman dilimi listesi
const timeZones = [
  "UTC",
  "America/Los_Angeles",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type Period = "AM" | "PM";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  // AM/PM
  const [period, setPeriod] = React.useState<Period>(
    date && date.getHours() >= 12 ? "PM" : "AM"
  );
  const [hours, setHours] = React.useState("12");
  const [minutes, setMinutes] = React.useState("00");

  // Yeni: Saat ve dakika geçersizse anlık hata mesajı
  const [hoursError, setHoursError] = React.useState("");
  const [minutesError, setMinutesError] = React.useState("");

  // Time Zone state (basit örnek)
  const [timeZone, setTimeZone] = React.useState("UTC");

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

  /** asıl clamp + setDate */
  function updateDate(hStr: string, mStr: string, p: Period) {
    const newDate = date ? new Date(date) : new Date();

    let hh = parseInt(hStr, 10);
    if (Number.isNaN(hh) || hh < 1) hh = 1;
    if (hh > 12) hh = 12;

    let mm = parseInt(mStr, 10);
    if (Number.isNaN(mm) || mm < 0) mm = 0;
    if (mm > 59) mm = 59;

    if (p === "PM") hh = (hh % 12) + 12;
    else hh = hh % 12;

    // İleri dönüştürme ile timeZone'u kullanmak isterseniz
    // date-fns-tz gibi bir kütüphane yardımıyla newDate'i 
    // timeZone'a göre ayarlayabilirsiniz. Burada sadece saklıyoruz.
    console.log("Selected Time Zone:", timeZone);

    newDate.setHours(hh, mm, 0, 0);
    setDate(newDate);
  }

  const handleHoursBlur = () => {
    updateDate(hours, minutes, period);
  };
  const handleMinutesBlur = () => {
    updateDate(hours, minutes, period);
  };

  /** Anlık hata kontrol (onChange içinde) */
  const handleHoursChange = (val: string) => {
    // Yalnızca rakamları bırak (harf girişini engellemek için)
    const sanitized = val.replace(/\D/g, "");
    setHours(sanitized);

    const parsed = parseInt(sanitized, 10);
    if (Number.isNaN(parsed)) {
      setHoursError("Invalid number");
    } else if (parsed < 1) {
      setHoursError("Minimum 1");
    } else if (parsed > 12) {
      setHoursError("Maximum 12");
    } else {
      setHoursError("");
    }
  };
  const handleMinutesChange = (val: string) => {
    // Yalnızca rakamları bırak (harf girişini engellemek için)
    const sanitized = val.replace(/\D/g, "");
    setMinutes(sanitized);

    const parsed = parseInt(sanitized, 10);
    if (Number.isNaN(parsed)) {
      setMinutesError("Invalid number");
    } else if (parsed < 0) {
      setMinutesError("Minimum 0");
    } else if (parsed > 59) {
      setMinutesError("Maximum 59");
    } else {
      setMinutesError("");
    }
  };

  /** AM/PM select tıklanırsa doğrudan clamp + setDate */
  const handlePeriodChange = (val: string) => {
    setPeriod(val as Period);
    updateDate(hours, minutes, val as Period);
  };

  // Basit TimeZone seçimi
  const handleTimeZoneChange = (val: string) => {
    setTimeZone(val);
    // Dilerseniz date-fns-tz ile newDate üzerinde 
    // val (zaman dilimi) ile dönüştürme yapabilirsiniz.
    updateDate(hours, minutes, period);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-4 items-end">
        {/* Hours */}
        <div className="flex flex-col">
          <Label className="mb-1 text-xs ml-2 font-normal">Hours</Label>
          <Input
            type="text"
            value={hours}
            onChange={(e) => handleHoursChange(e.target.value)}
            onBlur={handleHoursBlur}
            className="w-24 h-10 text-base px-3"
          />
          {hoursError ? (
            <span className="text-red-600 text-[0.7rem] mt-1">{hoursError}</span>
          ) : (
            <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
              1–12 only
            </span>
          )}
        </div>

        {/* Minutes */}
        <div className="flex flex-col">
          <Label className="mb-1 text-xs ml-2 font-normal">Minutes</Label>
          <Input
            type="text"
            value={minutes}
            onChange={(e) => handleMinutesChange(e.target.value)}
            onBlur={handleMinutesBlur}
            className="w-24 h-10 text-base px-3"
          />
          {minutesError ? (
            <span className="text-red-600 text-[0.7rem] mt-1">{minutesError}</span>
          ) : (
            <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
              00–59 only
            </span>
          )}
        </div>

        {/* AM/PM */}
        <div className="flex flex-col">
          <Label className="mb-1 text-xs ml-2 font-normal">AM/PM</Label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-24 h-10 text-base px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
            Choose AM or PM
          </span>
        </div>
      </div>

      {/* TimeZone Select */}
      <div className="flex flex-col">
        <Label className="mb-1 text-xs ml-2 font-normal">Time Zone</Label>
        <Select value={timeZone} onValueChange={handleTimeZoneChange}>
          <SelectTrigger className="w-44 h-10 text-base px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeZones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
          (Not converted in code yet)
        </span>
      </div>
    </div>
  );
}
