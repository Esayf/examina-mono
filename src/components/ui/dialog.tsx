"use client";
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  hasBlur?: boolean;
  className?: string;
}

/** Opsiyonel Overlay bileşeni */
interface DialogOverlayProps {
  onClick?: () => void;
  children?: React.ReactNode;
  classname?: string;
}

/** İç kutu (DialogContent) */
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

/** Başlık alanı */
interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}
/** Başlık metni */
interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

/** Açıklama alanı */
interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

/************************************************
 * ANA DIALOG
 ************************************************/
export function Dialog({ open, onOpenChange, children, hasBlur = true }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 
        flex items-center justify-center
        px-4 py-6
        bg-black/40 
        ${hasBlur ? "backdrop-blur-sm" : ""}
      `}
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  );
}

/************************************************
 * OPSİYONEL OVERLAY
 * (İsterseniz Dialog içinde kullanıp
 *  ek tıklama davranışları yazabilirsiniz.)
 ************************************************/
export function DialogOverlay({ onClick, children }: DialogOverlayProps) {
  return (
    <div onClick={onClick} className="w-full h-full">
      {children}
    </div>
  );
}

/************************************************
 * DIALOG CONTENT
 * - Mobil uyumlu genişlikler
 * - max-h, overflow-y: içerik uzun olursa kaydırma
 ************************************************/
export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={`
        relative
        p-6
        w-full
        h-full

        ${className ?? ""}
      `}
      onClick={(e) => e.stopPropagation()}
      // Kutuya tıklayınca kapanmayı engelle
    >
      {children}
    </div>
  );
}

/************************************************
 * DIALOG HEADER VE TITLE
 ************************************************/
export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4 mt-4 flex justify-between items-center">{children}</div>;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return <h1 className={className}>{children}</h1>;
}

/************************************************
 * DIALOG DESCRIPTION
 ************************************************/
export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return <p className={className}>{children}</p>;
}

/************************************************
 * KAPATMA BUTONU
 ************************************************/
export function DialogCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-3 rounded-full border-2 border-brand-primary-950 hover:bg-brand-secondary-200 text-brand-primary-900 hover:text-brand-primary-950 transition"
      aria-label="Close"
    >
      <XMarkIcon className="w-5 h-5" />
    </button>
  );
}
