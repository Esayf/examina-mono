// components/TypewriterText.tsx (örnek isim)
// ----------------------------------------------------
"use client";
import { cn } from "@/lib/utils";
import React from "react";
import Typewriter from "typewriter-effect";

interface TypewriterTextProps {
  textArray: string[];
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
}

export const TypewriterText = ({
  textArray,
  className,
  style,
  colors = ["#000"],
}: TypewriterTextProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Her 3 saniyede bir renk değişimi
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % colors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [colors.length]);

  const currentColor = colors[currentIndex];

  return (
    <div
      className={className}
      style={{
        ...style,
        color: currentColor,
        transition: "color 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Typewriter
        options={{
          strings: textArray,
          autoStart: true,
          loop: true, // true olursa döngü halinde yazar
          deleteSpeed: 50, // silme hızı
          delay: 75, // yazma hızı
          wrapperClassName: cn("Typewriter__wrapper", "hidden md:inline"),
          cursorClassName: cn("Typewriter__cursor", "hidden md:inline"),
        }}
      />
    </div>
  );
};
