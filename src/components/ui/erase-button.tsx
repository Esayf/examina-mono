import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";

interface EraseButtonProps {
  index: number;
  onRemove: (e: React.PointerEvent<HTMLElement>) => void;
  size?: "icon" | "icon-sm";
  duration?: number;
  className?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  confirmMessage: string;
}

const EraseButton: React.FC<EraseButtonProps> = ({
  index,
  onRemove,
  size = "icon-sm",
  duration = 600,
  className = "",
  isDisabled = false,
  isLoading = false,
  onConfirm = () => {},
  confirmMessage = "Are you sure you want to delete this item?",
}) => {
  const [progress, setProgress] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<DOMRect | null>(null);

  // Timer'ı ref olarak tutuyoruz: re-render'larda bozulma riskini azaltır
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Basılı tutma engellenecek mi?
    if (isDisabled || isLoading) return;

    setPressing(true);
    setProgress(0);
    setShowTooltip(false);

    const totalTime = duration; // 600ms veya props'tan
    const interval = 40; // Adım sıklığı
    const step = (100 / totalTime) * interval;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(intervalRef.current!);
          return 100;
        }
        return next;
      });
    }, interval);
  };

  const handlePressEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Timer iptal
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (pressing && progress >= 100) {
      // Uzun basma tamamlandı => Silme eylemi
      onRemove(e);
    }

    // Her durumda basma sıfırlanır
    setPressing(false);
    setProgress(0);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // ToolTip'in pozisyonunu alıyoruz
    if (!isDisabled && !isLoading) {
      setShowTooltip(true);
      setTooltipPosition(e.currentTarget.getBoundingClientRect());
    }
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
      document.body
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center hover:scale-110 transition-transform duration-200 ${className}`}
      style={{ width: "32px", height: "32px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderTooltip()}

      <Button
        variant="ghost"
        size={size}
        disabled={isDisabled || isLoading}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onClick={(e) => {
          // tıklama, pointer basma/çekme döngüsünü bozmamak adına iptal
          e.preventDefault();
          e.stopPropagation();
        }}
        className="relative w-8 h-8 rounded-full items-center justify-center transition-all duration-200 hover:bg-brand-secondary-200"
        style={{ width: "32px", height: "32px" }}
      >
        {/* Progres dairesi */}
        {pressing && (
          <div className="absolute inset-0 flex justify-center items-center">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32">
              <circle
                className="text-brand-secondary-400"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                r="13"
                cx="16"
                cy="16"
              />
              <circle
                className="text-brand-primary-800"
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

        {/* Çöp kovası ikonu */}
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default EraseButton;
