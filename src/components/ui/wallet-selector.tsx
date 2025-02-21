"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { XMarkIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Choz from "@/images/logo/choz-logo.svg";
import Auro from "@/images/logo/auro-logo.svg";
import Pallad from "@/images/logo/pallad-logo.svg";

import toast from "react-hot-toast";
import { authenticate } from "@/hooks/auth";
import { setSession } from "@/features/client/session";
import { useAppDispatch, useAppSelector } from "@/app/hooks"; // Önemli: Buradan dispatch'i çekiyoruz

import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { isMobile } from "react-device-detect";
import { cn } from "@/lib/utils";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  // 1) Gerçek dispatch fonksiyonunu alıyoruz
  const dispatch = useAppDispatch();
  const router = useRouter();
  const session = useAppSelector((state) => state.session);

  if (!isOpen) return null;

  // 2) Örnek fonksiyon: Masaüstü "Connect wallet" butonu
  const handleAuthentication = async () => {
    const res = await authenticate(session);
    if (!res) {
      toast.error("Failed to authenticate wallet!");
      return;
    }
    toast.success("Welcome back!", {
      duration: 15000,
      className: "chozToastSuccess",
    });
    // Redux store'a oturum bilgisini kaydediyoruz
    dispatch(setSession(res.session));
    onClose();
    window.location.href = "/app/dashboard/choose-role";
  };

  // 3) Auro cüzdan örneği
  const handleAuroWallet = async () => {
    const res = await authenticate(session);
    if (!res) {
      toast.error("Failed to authenticate wallet!");
      return;
    }
    toast.success("Welcome back!");
    // Redux store'a oturum bilgisini kaydediyoruz
    dispatch(setSession(res.session));
    onClose();
    // Başarılı ise dashboard'a yönlendirebilirsiniz
    window.location.href = "/app/dashboard/choose-role";
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-orange-200/50 backdrop-blur-md p-4">
      {/* Modal Kutusu */}
      <div
        className="
          absolute top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2
          w-[clamp(300px,100%,380px)]
          rounded-3xl
          bg-brand-secondary-100
          text-brand-primary-900
          border
          border-brand-primary-950
          p-6
          shadow-lg
          z-50
        "
      >
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute transition top-4 right-4 text-greyscale-light-600 hover:text-brand-primary-900 p-2 rounded-full border-2 border-greyscale-light-600 hover:border-brand-primary-900 hover:bg-brand-secondary-200"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* İçerik */}
        <div className="flex flex-col justify-center gap-2">
          <div className="w-full h-full flex items-center justify-center">
            <span>
              <Image src={Choz} height={80} alt="Choz Logo" />
            </span>
          </div>
          <h2 className="items-start text-lg font-normal mt-2">Connect with:</h2>
        </div>

        {/* Cüzdan Seçenekleri */}
        <div className="mt-6 space-y-2">
          <button
            className="
              w-full
              flex items-center gap-3
              bg-brand-secondary-50
              hover:bg-brand-secondary-200
              px-4 py-3
              border
              border-brand-primary-900
              rounded-full
              transition
            "
            onClick={handleAuroWallet}
          >
            <Image src={Auro} height={20} alt="Auro Logo" />
            <p>(Recommended)</p>
          </button>

          <button
            disabled
            className="
              w-full
              flex items-center gap-3
              bg-brand-secondary-50
              hover:bg-brand-secondary-200
              px-4 py-3
              border
              border-brand-primary-900
              rounded-full
              transition
              disabled:bg-greyscale-light-100
              disabled:border-greyscale-light-200
              disabled:text-greyscale-light-300
            "
            onClick={() => alert("Pallad wallet flow...")}
          >
            <Image src={Pallad} height={20} alt="Pallad Logo" className="opacity-50" />
          </button>

          {/* Bölücü (OR) */}
          <div className="flex items-center justify-center my-3">
            <div className="flex-1 h-[1px] bg-gray-600" />
            <span className="px-2 text-brand-primary-900">OR</span>
            <div className="flex-1 h-[1px] bg-gray-600" />
          </div>

          <div className="mt-6 space-y-2">
            <button
              disabled
              className="
                w-full
                flex items-center gap-3
                bg-brand-secondary-50
                hover:bg-brand-secondary-100
                px-4 py-3
                border
                border-brand-primary-900
                rounded-full
                transition
                disabled:bg-greyscale-light-100
                disabled:border-greyscale-light-200
                disabled:text-greyscale-light-300
              "
              onClick={() => alert("WalletConnect flow...")}
            >
              <span>Passkey (Soon)</span>
            </button>

            <button
              disabled
              className="
                w-full
                flex items-center gap-3
                bg-brand-secondary-50
                hover:bg-brand-secondary-100
                px-4 py-3
                border
                border-brand-primary-900
                rounded-full
                transition
                disabled:bg-greyscale-light-100
                disabled:border-greyscale-light-200
                disabled:text-greyscale-light-300
              "
              onClick={() => alert("WalletConnect flow...")}
            >
              <span>Discord (Soon)</span>
            </button>

            <button
              disabled
              className="
                w-full
                flex items-center gap-3
                bg-brand-secondary-50
                hover:bg-brand-secondary-100
                px-4 py-3
                border
                border-brand-primary-900
                rounded-full
                transition
                disabled:bg-greyscale-light-100
                disabled:border-greyscale-light-200
                disabled:text-greyscale-light-300
              "
              onClick={() => alert("WalletConnect flow...")}
            >
              <span>X (Formerly Twitter) (Soon)</span>
            </button>
          </div>
        </div>

        {/* "More wallet options" */}
        <div className="mt-3 text-center text-sm text-brand-primary-900">
          <button className="hover:underline transition">More wallet options</button>
        </div>
      </div>
    </div>
  );
}
