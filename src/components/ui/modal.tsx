"use client";

import React, { ReactNode } from "react";
// Kendi Button bileşeniniz (örnek: shadcn ui button)
import { Button } from "@/components/ui/button"; 
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;           // Modal’ın açık mı kapalı mı olduğu
  onClose: () => void;       // Modal’ı kapatma callback’i
  title?: string;            // Başlık (opsiyonel)
  children: ReactNode;       // İçerik
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50   /* Yarı saydam karartma */
        px-4 py-6
      "
    >
      <div
        className="
          relative
          w-full
          max-w-xl
          bg-white
          border border-gray-300
          rounded-3xl
          shadow-lg
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            border-b border-gray-200
            px-5 py-3
          "
        >
          <h2 className="text-lg font-semibold text-gray-800">
            {title || "My Custom Modal"}
          </h2>

          {/* Ghost Button + XMarkIcon */}
          <Button
            variant="outline"
            size={"icon"}
            className="
              transition-colors
              focus:outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-400
            "
            onClick={onClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Body (içerik) */}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
