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

/**
 * Bir Date'i bir sonraki 15 dakikalık slota yuvarlayan yardımcı fonksiyon.
 * Dakika:
 *   0..14   => 15
 *   15..29  => 30
 *   30..44  => 45
 *   45..59  => sonraki saat (dakika=00)
 */
function roundUpToNextSlot(date: Date) {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  if (minutes < 15) {
    newDate.setMinutes(15, 0, 0);
  } else if (minutes < 30) {
    newDate.setMinutes(30, 0, 0);
  } else if (minutes < 45) {
    newDate.setMinutes(45, 0, 0);
  } else {
    newDate.setHours(newDate.getHours() + 1, 0, 0, 0);
  }
  return newDate;
}

/**
 * getRoundedTimeWithRules:
 *  1) Eğer "base" şu andan (minBuffer) dk ötesinden az ise => (+5 dk, 15 dk slot, < minSlotThreshold => ileri slot)
 *  2) Yok eğer base, şu andan minBuffer dk daha uzaksa => dokunma (kullanıcı tam 12:00 PM seçebilsin)
 *
 *  @param base             Kullanıcının seçtiği Date (veya undefined)
 *  @param minBuffer        Min. buffer değeri (dakika) - default 5
 *  @param minSlotThreshold Son slota kadar min beklenen süre (dakika) - default 10
 *  @returns                Ayarlanmış (yuvarlanmış) bir Date
 */
function getRoundedTimeWithRules(base?: Date, minBuffer = 5, minSlotThreshold = 10): Date {
  const now = new Date();

  // base tanımsız veya geçmişse => şimdi
  let targetDate = !base || base < now ? now : base;

  // Şu an ile targetDate arasındaki dakika farkı
  const timeDifferenceMinutes = (targetDate.getTime() - now.getTime()) / 60000;

  // 1) Eğer targetDate, şu andan minBuffer dk'dan az bir uzaklıktaysa
  if (timeDifferenceMinutes < minBuffer) {
    // minBuffer dk ekle (örnek: 5 dk)
    targetDate = new Date(now.getTime() + minBuffer * 60_000);

    // 15 dakikalık en yakın slota yuvarla
    let roundedDate = roundUpToNextSlot(targetDate);

    // Eğer (roundedDate - now) < minSlotThreshold dk ise bir sonraki slota al
    const diffAfterRound = (roundedDate.getTime() - now.getTime()) / 60000;
    if (diffAfterRound < minSlotThreshold) {
      roundedDate = new Date(roundedDate.getTime() + 15 * 60_000);
    }
    return roundedDate;
  }

  // 2) Eğer timeDifferenceMinutes >= minBuffer => dokunma (tam 12:00 PM kalabilir)
  return targetDate;
}

/** AM/PM tipi */
type Period = "AM" | "PM";

/** Bileşen Props */
interface TimePickerProps {
  /** Dışarıdan gelen Date (parent state) */
  date: Date | undefined;
  /** Date güncellendiğinde parent'ı bilgilendirmek */
  setDate: (date: Date | undefined) => void;

  /** İsteğe bağlı: minBuffer (dakika) varsayılan = 5 */
  minBuffer?: number;
  /** İsteğe bağlı: minSlotThreshold (dakika) varsayılan = 10 */
  minSlotThreshold?: number;

  /**
   * Otomatik ayarlama olduğunda bir callback ile kullanıcıyı bilgilendirmek isterseniz.
   * (Örn. toast açmak, console.log yapmak vb.)
   */
  onTimeAdjusted?: (oldDate: Date | undefined, newDate: Date) => void;
}

/** Örnek zaman dilimi listesi (isteğe göre güncelleyebilirsiniz). */
const allTimeZones = [
  { label: "UTC", value: "UTC" },
  { label: "UTC-8 (America/Los_Angeles)", value: "America/Los_Angeles" },
  { label: "UTC+1 (Europe/Berlin)", value: "Europe/Berlin" },
  { label: "UTC+9 (Asia/Tokyo)", value: "Asia/Tokyo" },
  { label: "UTC+10 (Australia/Sydney)", value: "Australia/Sydney" },
  { label: "UTC+3 (Europe/Istanbul)", value: "Europe/Istanbul" },
];

/**
 * Ana TimePicker bileşeni (12 saat formatı, "00/15/30/45" dakikalık).
 * - minBuffer ve minSlotThreshold parametrelerini props'tan alır.
 * - eğer `onTimeAdjusted` varsa otomatik ileri atlamalarda callback çağırarak info verebilir.
 */
export function TimePicker({
  date,
  setDate,
  minBuffer = 5,
  minSlotThreshold = 10,
  onTimeAdjusted,
}: TimePickerProps) {
  const [period, setPeriod] = useState<Period>("AM");
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");

  // Mobilde tam ekran tablo açmak için
  const [showTimeZones, setShowTimeZones] = useState(false);
  // Diğer saat dilimlerini göstermek için sakladığımız veriler
  const [worldTimes, setWorldTimes] = useState<Record<string, string>>({});

  /**
   * 1) Bileşen ilk yüklendiğinde veya "date" değiştiğinde senkronize et.
   *    Eğer date geçmişteyse veya (date-now < minBuffer) ise => getRoundedTimeWithRules(date)
   *    Yoksa dokunmuyoruz ve hours/minutes/period state'lerini güncelliyoruz.
   */
  useEffect(() => {
    if (!date) {
      const newDate = getRoundedTimeWithRules(undefined, minBuffer, minSlotThreshold);
      setDate(newDate);
      return;
    }

    const now = new Date();
    const diff = (date.getTime() - now.getTime()) / 60000;

    if (date < now || diff < minBuffer) {
      const oldDate = date;
      const newDate = getRoundedTimeWithRules(date, minBuffer, minSlotThreshold);
      setDate(newDate);

      // Eğer otomatik ayarlandıysa callback
      if (onTimeAdjusted && oldDate.getTime() !== newDate.getTime()) {
        onTimeAdjusted(oldDate, newDate);
      }
      return;
    }

    // Aksi halde date gelecekte +5 dk'dan daha uzak => hours, minutes, period senkronize
    const h24 = date.getHours(); // 0..23
    const h12 = h24 % 12 || 12; // 1..12
    setHours(h12.toString());

    const m = date.getMinutes();
    if (m >= 0 && m < 15) setMinutes("00");
    else if (m < 30) setMinutes("15");
    else if (m < 45) setMinutes("30");
    else setMinutes("45");

    setPeriod(h24 >= 12 ? "PM" : "AM");
  }, [date, setDate, minBuffer, minSlotThreshold, onTimeAdjusted]);

  /**
   * 2) 'date' her güncellendiğinde, diğer dünya saatlerini hesapla.
   */
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

  /**
   * 3) Kullanıcı hours/minutes/AM-PM seçtiğinde çağrılır.
   *    => 12 saat formatından 24 saate çevir, baseDate'i güncelle,
   *       getRoundedTimeWithRules ile "buffer" mantığını uygula,
   *       otomatik ayarlama varsa onTimeAdjusted() callback'i çağır.
   */
  function updateDate(hStr: string, mStr: string, p: Period) {
    const oldDate = date;
    const baseDate = date ? new Date(date) : new Date();

    // 12 saat formatından => 24 saate
    let hh = parseInt(hStr, 10);
    if (Number.isNaN(hh) || hh < 1) hh = 1;
    if (hh > 12) hh = 12;

    let mm = parseInt(mStr, 10);
    if (Number.isNaN(mm)) mm = 0;

    if (p === "PM") {
      hh = (hh % 12) + 12;
    } else {
      hh = hh % 12; // 12 AM => 0
    }

    baseDate.setHours(hh, mm, 0, 0);

    // Kurallı yuvarlama
    const finalDate = getRoundedTimeWithRules(baseDate, minBuffer, minSlotThreshold);

    setDate(finalDate);

    // Eğer otomatik ayarlandıysa callback
    if (onTimeAdjusted && oldDate && oldDate.getTime() !== finalDate.getTime()) {
      onTimeAdjusted(oldDate, finalDate);
    }
  }

  // Dropdown değişimlerinde local state + asıl Date'i güncelliyoruz.
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
      {/* Saat & Dakika & AM/PM Seçimi */}
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
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="45">45</SelectItem>
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

      {/* Masaüstü görünüm: Dünya saatleri tablosu */}
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

      {/* Mobil görünüm: Tabloyu butonla aç */}
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
