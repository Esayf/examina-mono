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
            return 0;
          }
          return currentTime !== null ? currentTime - 1 : null;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout, startTimer]);

  return (
    <div className="flex items-center gap-2 py-1 px-2 bg-red-100 border border-red-500 rounded-full">
      <ClockIcon className="size-6 text-red-600" />
      <p className="text-red-600 font-bold text-lg py-1 px-2">
        {remainingTimeMiliseconds
          ? `${Math.floor(remainingTimeMiliseconds / 60)}:${(remainingTimeMiliseconds % 60)
              .toString()
              .padStart(2, "0")}`
          : "-"}
      </p>
    </div>
  );
};
