"use client";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Choz from "@/images/landing-header/logo-type.svg";
import styles from "@/styles/Landing.module.css";
import { toast } from "react-hot-toast";
import session, { setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";
import { useAppDispatch } from "@/app/hooks";
import Image from "next/image";
import { ArrowUpRightIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { WalletModal } from "@/components/ui/wallet-selector"; // Modal bileşeni
import SocialLinks from "./social-links";

interface HeaderProps {
  size: string;
  state: "not-connected" | "connected";
}

export const Header = ({ size, state }: HeaderProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  // Modal state (açık/kapalı)
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);

  // Cüzdan doğrulama fonksiyonu (Mina / Auro / vs.)
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
    dispatch(setSession(res.session));
    window.location.href = "/app/dashboard/created";
  };

  // Modal Aç / Kapat
  const openConnectModal = () => setConnectModalOpen(true);
  const closeConnectModal = () => setConnectModalOpen(false);

  // Modal içindeki "Connect Now" veya benzeri buton tıklanınca
  const confirmConnect = async () => {
    closeConnectModal();
    await handleAuthentication();
  };

  return (
    <header
      className={`
        ${styles.header} 
        bg-brand-secondary-100 
        border-b border-brand-secondary-100
      `}
    >
      {/* Header Container */}
      <div
        className={`
          ${styles.header_container} 
          w-full 
          mx-auto 
          flex 
          items-center 
          px-4
        `}
      >
        {/* SOL: Logo */}
        <div
          className={`${styles.logo_container} flex-shrink-0`}
          style={{ maxHeight: "50px", width: "175.81px" }}
        >
          <Image src={Choz} height={36} alt="Choz Logo" />
        </div>

        {/* ORTA: Linkler (md ve üzeri) */}
        {/* Social Links */}
        <div className="flex-row hidden md:block">
          <SocialLinks />
        </div>

        {/* SAĞ: Masaüstü Connect + Mobil Menü */}
        <div className="flex items-center gap-4 ml-4">
          {/* Masaüstü: Connect Wallet (Modal açar) */}
          <div className="hidden md:block justify-end items-center">
            <button
              className="group relative inline-block h-[60px] w-[200px] overflow-hidden rounded-full text-lg text-brand-primary-900 hover:text-brand-secondary-200 mt-3"
              onClick={openConnectModal}
            >
              <div className="h-[inherit] w-[inherit] overflow-hidden rounded-full bg-brand-tertiary-500 [transition:_transform_1.5s_cubic-bezier(.19,1,.22,1)] group-hover:scale-[.94]">
                <span className="absolute bottom-0 left-1/2 z-20 block h-[200%] w-[120%] -translate-x-0 translate-y-[100%] bg-brand-tertiary-600 [border-radius:999px_999px_0_0] [translate:-50%] group-hover:translate-y-[10px] group-hover:[border-radius:60%_60%_0_0] group-hover:[transition:_transform_1s_cubic-bezier(.19,1,.22,1)_200ms,_border-radius_.2s_cubic-bezier(.19,1,.22,1)_270ms]" />
                <span className="absolute bottom-0 left-1/2 z-20 block h-[200%] w-[120%] -translate-x-0 translate-y-[100%] bg-brand-secondary-400 [border-radius:999px_999px_0_0] [translate:-50%] group-hover:translate-y-[10px] group-hover:[border-radius:60%_60%_0_0] group-hover:[transition:_transform_1s_cubic-bezier(.19,1,.22,1)_300ms,_border-radius_.2s_cubic-bezier(.19,1,.22,1)_470ms]" />
                <span className="absolute bottom-0 left-1/2 z-20 block h-[200%] w-[120%] -translate-x-0 translate-y-[100%] bg-brand-primary-900 [border-radius:999px_999px_0_0] [translate:-50%] group-hover:translate-y-[10px] group-hover:[border-radius:60%_60%_0_0] group-hover:[transition:_transform_1s_cubic-bezier(.19,1,.22,1)_380ms,_border-radius_.2s_cubic-bezier(.19,1,.22,1)_670ms]" />
              </div>
              <span className="absolute inset-0 z-10 m-auto flex w-4/5 items-center justify-center font-medium group-hover:-translate-y-1/3 group-hover:opacity-0 group-hover:[transition:_transform_1s_cubic-bezier(.32,.99,.49,.99),_opacity_.4s]">
                Launch app
                <ArrowUpRightIcon className="w-6 h-6 ml-2 stroke-2"></ArrowUpRightIcon>
              </span>
              <span className="absolute inset-0 z-10 m-auto flex w-4/5 translate-y-1/3 items-center justify-center font-medium opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:[transition:_1s_all_cubic-bezier(.32,.99,.49,.99)]">
                Launch app
                <ArrowUpRightIcon className="w-6 h-6 ml-2 stroke-2"></ArrowUpRightIcon>
              </span>
            </button>
          </div>

          {/* HAMBURGER (Sadece mobilde) */}
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              variant="default"
              pill
              size="icon"
              className="text-brand-primary-950 focus:outline-none"
            >
              {menuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ (md altında açılır) */}
      {menuOpen && (
        <div
          className="
            md:hidden 
            absolute 
            top-20 
            right-4 
            w-48 
            z-50 
            shadow-lg 
            bg-brand-secondary-100 
            rounded-3xl 
            border 
            border-brand-primary-950
          "
        >
          <div className="flex flex-col items-start p-4 gap-4">
            <Button
              className="w-full text-left text-brand-primary-950 bg-brand-secondary-200"
              icon
              pill
              size="default"
              variant="default"
              onClick={() => window.open("https://x.com/chozapp", "_blank")}
            >
              X Account
              <ArrowUpRightIcon className="w-4 h-4" />
            </Button>

            <Button
              className="w-full text-brand-primary-950 bg-brand-secondary-200"
              icon={false}
              pill
              size="default"
              variant="default"
              onClick={() => window.open("https://choz.medium.com/", "_blank")}
            >
              Blog
            </Button>

            {/* Mobil: Connect Wallet (Modal) */}
            <Button
              className="w-full bg-brand-secondary-200 text-brand-primary-950"
              icon
              variant="default"
              pill
              size="default"
              onClick={openConnectModal}
            >
              Connect
              <ArrowUpRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Bileşeni (wallet-selector) */}
      <WalletModal
        isOpen={isConnectModalOpen}
        onClose={closeConnectModal}
        // Bu onConfirm fonksiyonu opsiyonel,
        // eğer wallet-selector bileşeninde "Confirm" veya "Connect Now" butonu kullanacaksanız
        // orada onConfirm'i tetikleyebilirsiniz.
        // onConfirm={confirmConnect}
      />
    </header>
  );
};

Header.propTypes = {
  size: PropTypes.oneOf(["xl"]),
  state: PropTypes.oneOf(["not-connected", "connected"]),
};
