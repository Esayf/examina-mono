import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface CounterProps {
  startDate: string; // Başlangıç tarihi (ISO string)
  duration: number; // Dakika cinsinden
  mutate: () => void;
  onTimeout: () => void;
}

export const Counter = ({ startDate, duration, mutate, onTimeout }: CounterProps) => {
  // Kalan süreyi milisaniye olarak tutuyoruz
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    // 1) Bitiş zamanını hesapla
    const start = new Date(startDate).getTime();
    const endTime = start + duration * 60_000;

    // 2) "tick" fonksiyonu: her 1 saniyede farkı hesapla
    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setRemainingMs(0);
        onTimeout(); // Sayaç bitti
        clearInterval(timerId);
      } else {
        setRemainingMs(diff);
      }
    };

    // İlk "tick"i hemen çalıştır
    tick();

    // 3) Her 1 sn'de bir "tick" çalıştır
    const timerId = setInterval(tick, 1000);

    // Temizlik
    return () => clearInterval(timerId);
  }, [startDate, duration, onTimeout]);

  // Milisaniyeyi saniyeye çevir
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const isLastMinute = totalSeconds <= 60 && totalSeconds > 0;

  return (
    <div
      className={`
        flex items-center gap-2 p-2 min-w-[140px] transition-all duration-300 ease-in-out
        ${
          isLastMinute
            ? "bg-ui-error-100 text-ui-error-600 border-ui-error-600 shadow-error animate-pulse"
            : "bg-ui-success-100 border-ui-success-500 text-ui-success-600 hover:bg-ui-success-200"
        }
        border-2 rounded-full
      `}
    >
      <ClockIcon
        className={`
          size-6 transition-transform hover:rotate-12
          ${isLastMinute ? "text-ui-error-600" : "text-ui-success-600"}
        `}
      />
      <p className="font-semibold text-lg py-1 px-2 min-h-[32px] min-w-[80px] tabular-nums">
        {totalSeconds <= 0 ? "0:00" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
      </p>
      {isLastMinute && <p className="font-bold text-lg animate-bounce">Last minute!</p>}
    </div>
  );
};
