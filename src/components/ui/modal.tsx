"use client";

import React, { ReactNode } from "react";
// Kendi Button bileşeniniz (örnek: shadcn ui button)
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean; // Modal’ın açık mı kapalı mı olduğu
  onClose: () => void; // Modal’ı kapatma callback’i
  title?: string; // Başlık (opsiyonel)
  children: ReactNode; // İçerik
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60   /* Yarı saydam karartma */
        px-4 py-6
      "
    >
      <div
        className="
          relative
          w-full
          max-w-xl
          bg-white
          border border-brand-primary-950
          rounded-3xl
          shadow-md
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            px-5 py-5 mt-1
          "
        >
          <h2 className="text-lg font-semibold text-gray-800">{title || "My Custom Modal"}</h2>

          {/* Ghost Button + XMarkIcon */}
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-base-white text-greyscale-light-600 hover:text-brand-primary-900 p-2 rounded-full border-2 border-greyscale-light-600 hover:border-brand-primary-900 hover:bg-brand-secondary-200"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Body (içerik) */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
