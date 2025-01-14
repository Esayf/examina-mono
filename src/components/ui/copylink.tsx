"use client";
import React, { useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

interface CopyLinkProps {
  link: string;  // Kopyalanacak link
  label?: string; // Opsiyonel etiket (ör. "Joining Link")
}

export function CopyLink({ link, label = "Your Quiz Link" }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // 1.5s sonra baloncuk kaybolsun
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {/* (isteğe bağlı) Üst etiket */}
      <label className="text-sm font-medium text-gray-800">
        {label}
      </label>

      <div className="relative flex items-center gap-2">
        {/* Göstermek için bir input (readOnly) */}
        <input
          type="text"
          value={link}
          readOnly
          className="
            w-full px-3 py-2 rounded-md border border-gray-300
            bg-gray-50 text-brand-primary-950
            focus:outline-none focus:border-brand-primary-800 focus:bg-brand-primary-50
          "
        />

        {/* Kopyalama butonu */}
        <button
          onClick={handleCopy}
          className="
            relative flex items-center justify-center
            w-13 h-12 rounded-full
            bg-white text-brand-primary-950
            hover:bg-brand-primary-100 focus:outline-none
          "
        >
          <ClipboardDocumentIcon className="w-7 h-7" />
          
          {/* “Copied” tooltip */}
          {copied && (
            <div
              className="
                absolute -top-8 right-1/2 translate-x-1/2
                px-2 py-1 rounded-md
                bg-brand-primary-950 text-brand-secondary-50 text-xs
                whitespace-nowrap
              "
            >
             Copied!
              <div
                className="
                  absolute bottom-[-6px] left-1/2 -translate-x-1/2
                  w-0 h-0
                  border-l-4 border-r-4 border-b-4 border-b-brand-primary-950
                  border-l-transparent border-r-transparent
                "
              />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
