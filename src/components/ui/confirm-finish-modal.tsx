import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

/**
 * Ufak bir modal: “Çıkış yapmak istediğine emin misin?” diye sorar.
 * `isOpen` true ise modal görünür, `onClose` ile kapatılır, `onConfirm` ile logout yapılır.
 */
export function ConfirmFinishModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: ConfirmFinishModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-brand-primary-950 p-6 max-w-sm w-full shadow-lg relative">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="default" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
