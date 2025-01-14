"use client";

import React, { useState, useEffect } from "react";

// Basit icon örneği. Renkleri Tailwind sınıflarıyla istediğiniz gibi değiştirebilirsiniz.
import { ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerModalProps {
  /** Şu anki tarih (Takvimden gelen). undefined ise henüz seçilmemiş */
  date: Date | undefined;
  /** Seçilen saati geri döndürmek için. newDate vs. atayabilirsiniz. */
  setDate: (date: Date | undefined) => void;
}

/**
 * Klasik saat/dakika/AM-PM ayarı. 
 *  - “Open”/“Close” mantığı yok; 
 *    anlık formda göstermek istediğinizde `date`/`setDate`’i kullanır.
 *  - Dilerseniz bir “modal” da ekleyebilirsiniz. Burada direct bir container.
 */
export function TimePickerModal({ date, setDate }: TimePickerModalProps) {
  // AM/PM
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  // Saat/dakika (string state)
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");

  // Mount edildiğinde veya `date` değiştiğinde, state güncelle
  useEffect(() => {
    if (!date) {
      setHours("12");
      setMinutes("00");
      setPeriod("AM");
      return;
    }
    const currentH = date.getHours();
    const h12 = (currentH % 12) || 12;
    setHours(String(h12));
    setMinutes(String(date.getMinutes()).padStart(2, "0"));
    setPeriod(currentH >= 12 ? "PM" : "AM");
  }, [date]);

  // Input blur (veya anlık) ile date’i güncelle
  function updateDate(hStr: string, mStr: string, p: "AM" | "PM") {
    if (!date) {
      // eğer date undefined ise yeni bir Date oluşturalım
      const newDate = new Date();
      applyTime(newDate, hStr, mStr, p);
      setDate(newDate);
      return;
    }
    // date varsa kopyalayalım
    const newDate = new Date(date);
    applyTime(newDate, hStr, mStr, p);
    setDate(newDate);
  }

  function applyTime(baseDate: Date, hStr: string, mStr: string, p: "AM" | "PM") {
    let hh = parseInt(hStr, 10);
    if (Number.isNaN(hh) || hh < 1) hh = 1;
    if (hh > 12) hh = 12;

    let mm = parseInt(mStr, 10);
    if (Number.isNaN(mm) || mm < 0) mm = 0;
    if (mm > 59) mm = 59;

    if (p === "PM") hh = (hh % 12) + 12; 
    else hh = hh % 12;

    baseDate.setHours(hh, mm, 0, 0);
  }

  // On blur hours
  const handleHoursBlur = () => {
    updateDate(hours, minutes, period);
  };
  // On blur minutes
  const handleMinutesBlur = () => {
    updateDate(hours, minutes, period);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      {/* Basit bir başlık / icon vs. */}
      <div className="flex items-center gap-2">
        <ClockIcon className="w-5 h-5 text-greyscale-light-800" />
        <span className="text-sm text-greyscale-light-800">Select Time</span>
      </div>

      <div className="flex gap-3 items-end">
        {/* Hours */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-greyscale-light-900 mb-1">
            Hours
          </label>
          <input
            type="text"
            className="
              w-16 h-9 text-base px-2 
              border rounded-md 
              border-greyscale-light-300
            "
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onBlur={handleHoursBlur}
          />
          <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
            1–12
          </span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-greyscale-light-900 mb-1">
            Minutes
          </label>
          <input
            type="text"
            className="
              w-16 h-9 text-base px-2 
              border rounded-md 
              border-greyscale-light-300
            "
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onBlur={handleMinutesBlur}
          />
          <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
            00–59
          </span>
        </div>

        {/* AM/PM */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-greyscale-light-900 mb-1">
            AM/PM
          </label>
          <select
            className="
              w-16 h-9 text-base px-2 
              border rounded-md 
              border-greyscale-light-300
            "
            value={period}
            onChange={(e) => {
              const val = e.target.value as "AM" | "PM";
              setPeriod(val);
              updateDate(hours, minutes, val);
            }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <span className="text-[0.7rem] text-greyscale-light-600 mt-1">
            12-hour
          </span>
        </div>
      </div>
    </div>
  );
}
