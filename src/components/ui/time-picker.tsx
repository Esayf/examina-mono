"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Period = "AM" | "PM";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

/** Örnek time zone listesi */
const allTimeZones = [
  { label: "UTC", value: "UTC" },
  { label: "UTC-8 (America/Los_Angeles)", value: "America/Los_Angeles" },
  { label: "UTC+1 (Europe/Berlin)", value: "Europe/Berlin" },
  { label: "UTC+9 (Asia/Tokyo)", value: "Asia/Tokyo" },
  { label: "UTC+10 (Australia/Sydney)", value: "Australia/Sydney" },
  { label: "UTC+3 (example)", value: "Europe/Istanbul" },
];

export function TimePicker({ date, setDate }: TimePickerProps) {
  const [period, setPeriod] = useState<Period>(date && date.getHours() >= 12 ? "PM" : "AM");
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [worldTimes, setWorldTimes] = useState<Record<string, string>>({});
  // Mobilde tam ekran tablo açmak için state:
  const [showTimeZones, setShowTimeZones] = useState(false);

  // Varsayılan değerleri yükle
  useEffect(() => {
    if (!date) {
      setHours("12");
      setMinutes("00");
      setPeriod("AM");
      return;
    }
    const h12 = date.getHours() % 12 || 12;
    setHours(h12.toString());
    setMinutes(date.getMinutes() >= 30 ? "30" : "00");
    setPeriod(date.getHours() >= 12 ? "PM" : "AM");
  }, [date]);

  // Yeni Date -> tüm global saatleri hesapla
  useEffect(() => {
    if (!date) return;
    const newTimes: Record<string, string> = {};

    allTimeZones.forEach((tz) => {
      const offsetTime = date.toLocaleTimeString("en-US", {
        timeZone: tz.value,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      newTimes[tz.label] = offsetTime;
    });

    setWorldTimes(newTimes);
  }, [date]);

  function updateDate(hStr: string, mStr: string, p: Period) {
    const newDate = date ? new Date(date) : new Date();

    let hh = parseInt(hStr, 10);
    if (Number.isNaN(hh) || hh < 1) hh = 1;
    if (hh > 12) hh = 12;

    let mm = parseInt(mStr, 10);
    if (Number.isNaN(mm)) mm = 0;

    if (p === "PM") {
      hh = (hh % 12) + 12;
    } else {
      hh = hh % 12;
    }

    newDate.setHours(hh, mm, 0, 0);
    setDate(newDate);
  }

  const handlePeriodChange = (val: string) => {
    setPeriod(val as Period);
    updateDate(hours, minutes, val as Period);
  };
  const handleHoursChange = (val: string) => {
    setHours(val);
    updateDate(val, minutes, period);
  };
  const handleMinutesChange = (val: string) => {
    setMinutes(val);
    updateDate(hours, val, period);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Saat seçimi (Hours, Minutes, AM/PM) */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
        {/* Hours */}
        <div className="flex flex-col">
          <Label className="mb-1 text-xs ml-2 font-normal">Hours</Label>
          <Select value={hours} onValueChange={handleHoursChange}>
            <SelectTrigger className="w-16 sm:w-24 h-10 text-base px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minutes */}
        <div className="flex flex-col">
          <Label className="mb-1 text-xs ml-2 font-normal">Minutes</Label>
          <Select value={minutes} onValueChange={handleMinutesChange}>
            <SelectTrigger className="w-16 sm:w-24 h-10 text-base px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="00">00</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AM/PM */}
        <div className="flex flex-col">
          <Label className="mb-1 text-xs ml-2 font-normal">AM/PM</Label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-16 sm:w-24 h-10 text-base px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Masaüstü görünüm: tablo doğrudan görünsün */}
      <div className="hidden md:block timezones-desktop-table">
        <table className="w-full text-left">
          <thead className="bg-brand-secondary-200 sticky top-0">
            <tr>
              <th className="p-2 font-medium bg-brand-secondary-100 hover:bg-brand-secondary-100 border-b border-b-brand-secondary-200">
                Time Zone
              </th>
              <th className="p-2 font-medium bg-brand-secondary-100 hover:bg-brand-secondary-100 border-b border-b-brand-secondary-200">
                Local Time
              </th>
            </tr>
          </thead>
          <tbody>
            {allTimeZones.map((tz) => (
              <tr key={tz.label} className="hover:bg-brand-secondary-50">
                <td className="p-2 bg-brand-secondary-50 hover:bg-brand-secondary-50 text-brand-primary-900">
                  {tz.label}
                </td>
                <td className="p-2 bg-brand-secondary-50 hover:bg-brand-secondary-100 text-brand-primary-900">
                  {worldTimes[tz.label] ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bilgilendirici metin */}
      <div className="bg-ui-warning-50 border border-yellow-300 p-3 rounded-2xl text-sm text-ui-warning-900">
        We automatically show several global time zones below.
        <span className="hidden md:inline">
          (UTC, LA, Berlin, Tokyo, Sydney...) No need to select a time zone!
        </span>
      </div>

      {/* Mobil görünümde tablo yerine buton */}
      <div className="block md:hidden">
        <Button variant="outline" className="w-full mt-2" onClick={() => setShowTimeZones(true)}>
          Show time zones
        </Button>
      </div>

      {/* Mobilde tablo tam ekran kaplasın */}
      {showTimeZones && (
        /* Arka planı hafif karartarak odak veriyoruz. */
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Alt taraftan çıkan panel */}
          <div
            className="
      w-full bg-brand-secondary-50 border border-greyscale-light-200 rounded-2xl shadow-lg
      p-4
      animation-slide-up  /* Opsiyonel, yumuşak animasyon (ekleyebilirsiniz) */
    "
          >
            {/* Üst kısım: Başlık + Kapat Butonu */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-brand-primary-900">Global Time Zones</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setShowTimeZones(false)}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* İçerik: tablo */}
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-brand-secondary-100">
                  <tr>
                    <th className="p-2 font-medium border-b border-b-brand-secondary-200">
                      Time Zone
                    </th>
                    <th className="p-2 font-medium border-b border-b-brand-secondary-200">
                      Local Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allTimeZones.map((tz) => (
                    <tr key={tz.label} className="hover:bg-brand-secondary-50">
                      <td className="p-2 text-brand-primary-900">{tz.label}</td>
                      <td className="p-2 text-brand-primary-800">{worldTimes[tz.label] ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
