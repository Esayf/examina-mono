"use client";

import React, { useEffect, useState } from "react";

/** Tarayıcı destekliyorsa tüm IANA time zone dizisini döndür.
 *  Aksi halde fallback bir liste kullanabilirsiniz.
 */
function getAllTimeZones(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    // Modern tarayıcı
    return Intl.supportedValuesOf("timeZone");
  } else {
    // Fallback: manuel liste veya bir kütüphane (moment-timezone vs.)
    return [
      "UTC",
      "America/Los_Angeles",
      "Europe/Istanbul",
      "Asia/Tokyo",
      // ...
      // kısıtlı bir liste
    ];
  }
}

interface WorldTimesProps {
  /**
   * Kullanıcının seçtiği tarih/saat.
   * Örneğin TimePicker’dan gelen Date nesnesi.
   */
  date: Date | undefined;
}

export default function WorldTimes({ date }: WorldTimesProps) {
  const [timeZones, setTimeZones] = useState<string[]>([]);
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    // Uygulama ilk açıldığında tüm time zone listesini al:
    const tzList = getAllTimeZones();
    setTimeZones(tzList);
  }, []);

  useEffect(() => {
    // Kullanıcı date seçmişse, her time zone için o anki saati hesaplayıp tabloya yansıt:
    if (!date) return;
    const newTimes: Record<string, string> = {};
    timeZones.forEach((tz) => {
      const localStr = date.toLocaleTimeString("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      newTimes[tz] = localStr;
    });
    setTimes(newTimes);
  }, [date, timeZones]);

  if (!date) {
    return <div className="text-red-600">No date selected. Please pick a time first.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">All Time Zones</h2>
      <p className="text-sm">
        Below is the current time for your selected date in all available time zones (IANA list).
        This might be a very large table!
      </p>

      <div className="border rounded overflow-auto h-[60vh]">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-secondary-200 sticky top-0">
            <tr>
              <th className="p-2">Time Zone</th>
              <th className="p-2">Local Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {timeZones.map((tz) => (
              <tr key={tz}>
                <td className="p-2">{tz}</td>
                <td className="p-2">{times[tz] ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
