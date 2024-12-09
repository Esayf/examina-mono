import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface CounterProps {
  startDate: string;
  duration: number;
  mutate: () => void;
  onTimeout: () => void;
}

export const Counter = ({ startDate, duration, mutate, onTimeout }: CounterProps) => {
  const [startTimer, setStartTimer] = useState<boolean>(false);
  const [remainingTimeMiliseconds, setRemainingTimeMiliseconds] = useState<number | null>(null);

  useEffect(() => {
    setRemainingTimeMiliseconds((prev) => {
      if (prev === null) {
        setStartTimer(true);
        return Math.floor(
          (new Date(startDate).getTime() + duration * 60000 - new Date().getTime()) / 1000
        );
      }
      return prev - 1;
    });
  }, [startDate, duration]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (startTimer) {
        setRemainingTimeMiliseconds((currentTime) => {
          if (currentTime !== null && currentTime <= 0) {
            clearInterval(timer);
            onTimeout();
            return 0; // Sayaç sıfıra ulaştığında burada durduruluyor
          }
          return currentTime !== null ? currentTime - 1 : null;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout, startTimer]);

  const isLastMinute = remainingTimeMiliseconds !== null && remainingTimeMiliseconds <= 60;

  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 min-w-[100px] border rounded-full ${
        isLastMinute
          ? "bg-ui-error-100 text-ui-error-600 animate-pulse border-ui-error-600"
          : "bg-ui-success-100 border-ui-success-500 text-ui-success-600"
      }`}
    >
      <ClockIcon className={`size-6 ${isLastMinute ? "text-ui-error-600" : "text-ui-success-600"}`} />
      <p className="font-semibold text-base py-1 px-2">
        {remainingTimeMiliseconds !== null && remainingTimeMiliseconds >= 0
          ? `${Math.floor(remainingTimeMiliseconds / 60)}:${(remainingTimeMiliseconds % 60)
              .toString()
              .padStart(2, "0")}`
          : "0:00"} {/* Sayaç sıfıra ulaştığında 0:00 gösterilir */}
      </p>
      {isLastMinute && <p className="font-bold text-lg ml-2">Last seconds!</p>}
    </div>
  );
};
