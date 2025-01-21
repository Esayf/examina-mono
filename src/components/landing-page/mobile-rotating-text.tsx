// components/MobileRotatingText.tsx
"use client";

import React, { useState, useEffect } from "react";

/**
 * textArray içinden gelen metinleri belirli aralıklarla (örneğin 3sn)
 * değiştirerek göstermek için basit bir 'rotating text' mantığı.
 */
interface MobileRotatingTextProps {
  textArray: string[];
  interval?: number; // Değiştirme sıklığı (ms cinsinden), default 3000 ms
}

export const MobileRotatingText: React.FC<MobileRotatingTextProps> = ({
  textArray,
  interval = 3000,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % textArray.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, textArray.length]);

  return <h2 className="text-sm font-semibold text-center text-[#460E3E]">{textArray[index]}</h2>;
};
