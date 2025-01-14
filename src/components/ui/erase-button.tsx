import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";

interface EraseButtonProps {
  onRemove: () => void; // Silme işlemini tetikleyen fonksiyon (zorunlu)
  size?: "icon" | "icon-sm"; // Buton boyutu (varsayılan: icon)
  duration?: number; // Uzun tıklama süresi (milisaniye) (varsayılan: 1000ms)
  className?: string; // Ekstra CSS sınıfı (opsiyonel)
}

const EraseButton: React.FC<EraseButtonProps> = ({
  onRemove, // Dışarıdan gelen silme fonksiyonu
  size = "icon-sm",
  duration = 1000, // Varsayılan uzun tıklama süresi
  className = "",
}) => {
  const [progress, setProgress] = useState(0); // İlerleme durumu
  const [pressing, setPressing] = useState(false); // Uzun tıklama durumu
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false); // Tooltip görünürlüğü
  const [tooltipPosition, setTooltipPosition] = useState<DOMRect | null>(null);

  const handlePressStart = () => {
    setPressing(true);
    setProgress(0);
    setShowTooltip(false); // Tooltip'i gizle

    const interval = 80; // Animasyon adım süresi
    const step = (100 / 1000) * interval; // İlerleme adımı

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + step;
        if (nextProgress >= 100) {
          clearInterval(intervalId); // İlerleme tamamlandığında interval'ı temizle
          onRemove(); // Silme işlemini tetikle
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

    if (timer) {
      clearInterval(timer); // Zamanlayıcıyı temizle
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowTooltip(true);
    setTooltipPosition(e.currentTarget.getBoundingClientRect()); // Tooltip pozisyonunu hesapla
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const renderTooltip = () => {
    if (!tooltipPosition || !showTooltip) return null;

    return createPortal(
      <div
        className="absolute bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-[9999]"
        style={{
          top: tooltipPosition.top + tooltipPosition.height / 2,
          left: tooltipPosition.right + 8,
          transform: "translateY(-50%)",
        }}
      >
        Hold to delete
      </div>,
      document.body // Tooltip'i body'nin içine yerleştir
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center hover:scale-110 transition-transform duration-200 ${className}`}
      style={{
        width: "32px",
        height: "32px",
      }}
      onMouseEnter={handleMouseEnter} // Masaüstü cihazlarda hover
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip */}
      {renderTooltip()}

      {/* Silme Butonu */}
      <Button
        variant="ghost"
        size={size}
        onPointerDown={handlePressStart} // Uzun tıklama başladığında
        onPointerUp={handlePressEnd} // Tıklama bırakıldığında
        onPointerLeave={handlePressEnd} // Fare butondan ayrıldığında
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className="relative w-8 h-8 rounded-full items-center justify-center transition-all duration-200 hover:bg-transparent"
        style={{
          width: "32px",
          height: "32px",
        }}
      >
        {/* Halka Animasyonu */}
        {pressing && (
          <div className="absolute inset-0 flex justify-center items-center">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="text-brand-primary-800"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                r="13"
                cx="16"
                cy="16"
              />
              <circle
                className="text-brand-primary-500"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                r="14"
                cx="16"
                cy="16"
                strokeDasharray={88}
                strokeDashoffset={88 - (progress / 100) * 88}
                style={{
                  transition: "stroke-dashoffset 0.1s linear",
                  transformOrigin: "center",
                  transform: "rotate(-90deg)",
                }}
              />
            </svg>
          </div>
        )}
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default EraseButton;
