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
  /** Dışarıdan gelen Date değeri (örn. üst bileşenden state) */
  date: Date | undefined;
  /** Date güncellendiğinde üst bileşeni bilgilendirmek için. */
  setDate: (date: Date | undefined) => void;
}

/** 1) Basit zaman dilimleri listesi (tablodaki örnek). */
const allTimeZones = [
  { label: "UTC", value: "UTC" },
  { label: "UTC-8 (America/Los_Angeles)", value: "America/Los_Angeles" },
  { label: "UTC+1 (Europe/Berlin)", value: "Europe/Berlin" },
  { label: "UTC+9 (Asia/Tokyo)", value: "Asia/Tokyo" },
  { label: "UTC+10 (Australia/Sydney)", value: "Australia/Sydney" },
  { label: "UTC+3 (example)", value: "Europe/Istanbul" },
];

/** 2) Dakikayı 30'a, sonrasını da bir sonraki saate (00'a) yuvarlayarak ileri çekme fonksiyonu */
function roundUpToNextSlot(d: Date) {
  const newD = new Date(d);
  const m = newD.getMinutes();
  if (m < 30) {
    newD.setMinutes(30);
  } else {
    newD.setHours(newD.getHours() + 1, 0);
  }
  return newD;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const [period, setPeriod] = useState<Period>("AM");
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");

  // Mobilde tam ekran tablo açmak için:
  const [showTimeZones, setShowTimeZones] = useState(false);
  // Diğer saat dilimlerini göstermek için kaydettiğimiz zamanlar:
  const [worldTimes, setWorldTimes] = useState<Record<string, string>>({});

  /**
   * 3) Komponent her renderlandığında veya date güncellenince çalışır.
   *    - Eğer date yoksa veya geçmiş bir zamansa, "şu an"ı alıp roundUpToNextSlot ile ileri yuvarlarız.
   *    - Değilse, hours, minutes, period state'lerini senkronize ederiz.
   */
  useEffect(() => {
    const now = new Date();
    if (!date || date < now) {
      // Date yoksa veya geçmişse => şu an'ı en yakın yarım/tam saate yuvarla
      const newDate = roundUpToNextSlot(now);
      setDate(newDate);
      return; // Henüz date değiştiği için, hours & minutes atamasını bir sonraki render yapacak
    }

    // Buraya geldiysek date gelecekte veya "şu an" demektir.
    const h24 = date.getHours(); // 0..23
    const h12 = h24 % 12 || 12; // 1..12
    setHours(h12.toString());
    setMinutes(date.getMinutes() >= 30 ? "30" : "00");
    setPeriod(h24 >= 12 ? "PM" : "AM");
  }, [date, setDate]);

  /**
   * 4) Date her değiştiğinde "worldTimes" tablomuza yeni değerler yazalım.
   *    Not: Bu, date set edildikten sonra tabloyu güncel tutar.
   */
  useEffect(() => {
    if (!date) return;
    const newTimes: Record<string, string> = {};
    allTimeZones.forEach((tz) => {
      // "en-US" formatında, AM/PM + saat/dakika
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

  /**
   * 5) Kullanıcı dropdown'lardan saat/dakika/AM-PM seçince buraya gelir.
   *    Eğer seçilen zaman 'geçmiş' olursa, yine anında roundUpToNextSlot(now) yaparız.
   */
  function updateDate(hStr: string, mStr: string, p: Period) {
    // Şu anki date var mı? Yoksa "şimdi" diyelim (çok gerek kalmaz,
    // yukarıdaki effectte yoksa zaten setDate ile dolduruyoruz).
    const baseDate = date ? new Date(date) : new Date();

    // Kullanicinin seçtiği hour & minute
    let hh = parseInt(hStr, 10);
    if (Number.isNaN(hh) || hh < 1) hh = 1;
    if (hh > 12) hh = 12;

    let mm = parseInt(mStr, 10);
    if (Number.isNaN(mm)) mm = 0;

    // AM/PM dönüştür
    if (p === "PM") {
      hh = (hh % 12) + 12; // 1 PM => 13
    } else {
      hh = hh % 12; // 12 AM => 0
    }

    baseDate.setHours(hh, mm, 0, 0);

    // Geçmiş olmasın => eğer bu saat "şu an"dan gerideyse yuvarla
    const now = new Date();
    let finalDate = baseDate < now ? roundUpToNextSlot(now) : baseDate;

    // Değeri state'e bas
    setDate(finalDate);
  }

  // Bu üç handle fonksiyonda, önce local state'i güncelliyoruz,
  // sonra "updateDate" ile asıl Date'i hesaplıyoruz.
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
      {/* Seçim alanları: Hours, Minutes, AM/PM */}
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

      {/* Masaüstü görünüm: tablo */}
      <div className="hidden md:block timezones-desktop-table">
        <table className="w-full text-left">
          <thead className="bg-brand-secondary-200 sticky top-0">
            <tr>
              <th className="p-2 font-medium bg-brand-secondary-100 border-b border-b-brand-secondary-200">
                Time Zone
              </th>
              <th className="p-2 font-medium bg-brand-secondary-100 border-b border-b-brand-secondary-200">
                Local Time
              </th>
            </tr>
          </thead>
          <tbody>
            {allTimeZones.map((tz) => (
              <tr key={tz.label} className="hover:bg-brand-secondary-50">
                <td className="p-2 bg-brand-secondary-50 text-brand-primary-900">{tz.label}</td>
                <td className="p-2 bg-brand-secondary-50 text-brand-primary-900">
                  {worldTimes[tz.label] ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bilgilendirici metin */}
      <div className="bg-ui-warning-50 border border-yellow-00 p-3 rounded-2xl text-sm text-ui-warning-900">
        We automatically show several global time zones below.
        <span className="hidden md:inline">
          (UTC, LA, Berlin, Tokyo, Sydney...) No need to select a time zone!
        </span>
      </div>

      {/* Mobilde tabloyu butonla açalım */}
      <div className="block md:hidden">
        <Button variant="outline" className="w-full mt-2" onClick={() => setShowTimeZones(true)}>
          Show time zones
        </Button>
      </div>

      {/* Mobil tam ekran tablo */}
      {showTimeZones && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/20">
          <div className="w-full bg-brand-secondary-50 border border-greyscale-light-200 rounded-2xl shadow-lg p-4">
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
