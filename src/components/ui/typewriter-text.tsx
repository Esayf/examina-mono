// components/TypewriterText.tsx (örnek isim)
// ----------------------------------------------------
"use client";
import React from "react";
import Typewriter from "typewriter-effect";

interface TypewriterTextProps {
  textArray: string[];
  className?: string[];
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ textArray }) => {
  return (
    <div style={{ fontSize: "6rem", fontWeight: 700, color: "#460E3E" }}>
      <Typewriter
        options={{
          strings: textArray,
          autoStart: true,
          loop: true, // true olursa döngü halinde yazar
          deleteSpeed: 50, // silme hızı
          delay: 75,       // yazma hızı
        }}
      />
    </div>
  );
};
