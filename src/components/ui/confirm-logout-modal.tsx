import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Ufak bir modal: “Çıkış yapmak istediğine emin misin?” diye sorar.
 * `isOpen` true ise modal görünür, `onClose` ile kapatılır, `onConfirm` ile logout yapılır.
 */
export function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmLogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-brand-primary-950 p-6 max-w-sm w-full shadow-lg relative">
      <h2 className="text-lg font-bold mb-2">Leaving so soon?</h2>
      <p className="text-sm text-gray-600 mb-4">
      We’ll keep everything ready for you until you come back. 🫡
      </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            No.
          </Button>
          <Button variant="default" onClick={onConfirm}>
           Yes, promise, I'll return! 🤥
          </Button>
        </div>
      </div>
    </div>
  );
}
