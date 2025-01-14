"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * BaseModalProps:
 * - open: Modal açık/kapalı kontrolü
 * - onClose: Modal kapatma fonksiyonu (arka plana tıklayınca, X'e tıklayınca vb.)
 * - children: Modal içeriği
 */
interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ open, onClose, children }: BaseModalProps) {
  if (!open) return null; // Kapalıyken hiç render etme

  return (
    <div
      className="
        fixed inset-0 z-50 
        flex items-center justify-center 
        bg-black/40
      "
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      // backdrop’a tıklayınca modalı kapat
    >
      <div
        className="
          relative 
          bg-white 
          rounded-xl 
          p-4 
          max-w-sm w-full 
          shadow-md 
          border border-gray-200
        "
        onClick={(e) => e.stopPropagation()}
        // İç kısma tıklamayı durdur, modal kapanmasın
      >
        {/* Sağ üst köşede kapatma ikonu */}
        <button
          className="
            absolute 
            top-3 
            right-3 
            text-gray-500 
            hover:text-gray-800
          "
          onClick={onClose}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal gövdesi: Props.children */}
        {children}
      </div>
    </div>
  );
}
