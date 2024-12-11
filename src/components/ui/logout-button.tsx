import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { logout } from "@/lib/Client/Auth";

const LONG_PRESS_DURATION = 1000; // Uzun tıklama süresi (1 saniye)

export const LogoutButton: React.FC = () => {
  const [pressing, setPressing] = useState(false); // Uzun tıklama durumu
  const [progress, setProgress] = useState(0); // Halka ilerleme durumu
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePressStart = () => {
    setPressing(true);
    setProgress(0);

    const interval = 100; // Her 10ms'de bir ilerleme
    const step = (100 / LONG_PRESS_DURATION) * interval; // Yüzde artışı

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + step;
        if (nextProgress >= 100) {
          clearInterval(intervalId);
          logout()
            .then(() => {
              toast.success("Logged out successfully");
              window.location.replace(window.location.origin);
            })
            .catch(() => {
              toast.error("Failed to log out. Please try again.");
            });
          return 100;
        }
        return nextProgress;
      });
    }, interval);

    setTimer(intervalId as unknown as NodeJS.Timeout);
  };

  const handlePressEnd = () => {
    setPressing(false);
    setProgress(0);

    // Tıklama bırakıldığında zamanlayıcıyı temizle
    if (timer) {
      clearInterval(timer);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      pill
      onPointerDown={handlePressStart} // Tıklama başladığında
      onPointerUp={handlePressEnd} // Tıklama bırakıldığında
      onPointerLeave={handlePressEnd} // Fare butondan çıkarılırsa işlemi iptal et
      className="relative"
    >
      {/* Halka Animasyonu */}
      {pressing && (
        <div className="absolute inset-0 flex justify-center items-center">
          <svg className="absolute inset-0 w-full h-full"
          viewBox="0 0 52 52"
          xmlns="http://www.w3.org/2000/svg">
            <circle
              className="text-brand-primary-800"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              r="24"
              cx="26"
              cy="26"
            />
            <circle
              className="text-brand-primary-500"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              r="24"
              cx="26"
              cy="26"
              strokeDasharray={151}
              strokeDashoffset={151 - (progress / 100) * 151}
              style={{
                transition: "stroke-dashoffset 0.1s linear",
                transformOrigin: "center",
                transform: "rotate(-90deg)", // İlerleme üstten başlar
              }}
            />
          </svg>
        </div>
      )}

      {/* Logout İkonu */}
      <ArrowRightOnRectangleIcon className="w-6 h-6" />
    </Button>
  );
};

export default LogoutButton;
