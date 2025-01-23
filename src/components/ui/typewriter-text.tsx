// components/TypewriterText.tsx (örnek isim)
// ----------------------------------------------------
"use client";
import { cn } from "@/lib/utils";
import React from "react";
import Typewriter from "typewriter-effect";

interface TypewriterTextProps {
  textArray: string[];
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ textArray, className }) => {
  return (
    <div style={{ fontSize: "6rem", fontWeight: 700, color: "#460E3E" }}>
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
