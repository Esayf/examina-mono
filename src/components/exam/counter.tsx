import { useEffect, useState } from "react";

import { ClockIcon } from "@heroicons/react/24/outline";

interface CounterProps {
  startDate: string;
  duration: number;
  mutate: () => void;
}

export const Counter = ({ startDate, duration, mutate }: CounterProps) => {
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
    const timer = setInterval((remainingTimeMiliseconds) => {
      if (startTimer) {
        setRemainingTimeMiliseconds((el) => (el !== null ? el - 1 : null));
      }
      if (startTimer && remainingTimeMiliseconds && remainingTimeMiliseconds <= 0) {
        mutate();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mutate, startTimer]);

  return (
    <div className="flex items-center gap-4 p-2 bg-red-100 border border-red-500 rounded-md">
      <ClockIcon className="size-6 text-red-600" />
      <p className="text-red-600 font-bold text-lg">
        {remainingTimeMiliseconds
          ? `${Math.floor(remainingTimeMiliseconds / 60)}:${(remainingTimeMiliseconds % 60)
              .toString()
              .padStart(2, "0")}`
          : "-"}
      </p>
    </div>
  );
};
