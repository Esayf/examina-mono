import { cn } from "@/lib/utils";
import React from "react";

interface PincodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PincodeInput = ({ value, onChange }: PincodeInputProps) => {
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const value = e.clipboardData.getData('text')
    .slice(0, 6)
    .toLocaleUpperCase("en-US")
    .replace(/[İı]/g, "I")
    .replace(/[^A-Z0-9]/g, "");
    onChange(value);

    document.getElementById(`pin-${Math.min(value.length, 5)}`)?.focus();
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === "v" ) return;
    
    let key = (/^[A-Za-z0-9]$/.test(e.key)) ? "alphanumeric" : e.key;
    const newPin = value.split(''); 

    switch (key) {
      case "alphanumeric":
        newPin[index] = e.key
          .toLocaleUpperCase("en-US")
          .replace(/[İı]/g, "I")
          .replace(/[^A-Z0-9]/g, "");
        onChange(newPin.join(''));
        
        if (index < 5) {
          e.preventDefault();
          document.getElementById(`pin-${index+1}`)?.focus();
        }
        break;
      case "Backspace":
        if (newPin[index] !== '' && newPin[index] !== undefined) {
          newPin[index] = '';
          onChange(newPin.join(''));
          break;
        }
        if (index > 0) {
          e.preventDefault();
          document.getElementById(`pin-${index - 1}`)?.focus();
        }
        break;
      case "ArrowLeft":
        if (index > 0) {
          e.preventDefault();
          document.getElementById(`pin-${index - 1}`)?.focus();
          }
        break;
      case "ArrowRight":
        if (index < 5) {
          e.preventDefault();
          document.getElementById(`pin-${index + 1}`)?.focus();
        }
        break;
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {[...Array(6)].map((_, index) => (
        <React.Fragment key={index}>
          <input
            type="text"
            maxLength={1}
            defaultValue={value[index] || ""}
            onPaste={(e) => handlePaste(e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              "w-8 sm:w-12 h-10 sm:h-12",
              "text-center text-base sm:text-lg font-semibold",
              "tracking-wide px-1 [&::-webkit-inner-spin-button]:appearance-none",
              "border border-greyscale-light-200 rounded-xl",
              "focus:ring-2 focus:ring-brand-primary-700 focus:ring-offset-2 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            id={`pin-${index}`}
          />
          {index === 2 && (
            <span className="flex items-center text-greyscale-light-400 select-none">
              -
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 