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
import X from "@/images/logo/x-logo.png";
import Github from "@/images/logo/github-logo.png";
// Örn. Telegram yerine LinkedIn:
import Linkedin from "@/images/logo/linkedin-logo.png";
import Medium from "@/images/logo/medium-logo.png";
import Auro from "@/images/logo/auro-logo-brand.svg";

interface HeaderProps {
  size: string;
  state: "not-connected" | "connected";
}

export const Header = ({ size, state }: HeaderProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  // Modal state (açık/kapalı)
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);

  // Cüzdan doğrulama fonksiyonu
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
        fixed top-0 left-0 w-full
        z-[9999]
        bg-brand-secondary-100 
        border-b border-brand-secondary-100 h-22
      `}
    >
      {/* Header Container */}
      <div
        className={`
          ${styles.header_container} 
          w-full 
          flex 
          items-center 
          justify-between
          z-50
        `}
      >
        {/* SOL: Logo */}
        <div
          className={`${styles.logo_container} flex-shrink-0`}
          style={{ maxHeight: "52px", alignContent: "center", width: "200px" }}
        >
          <Image src={Choz} height={36} alt="Choz Logo" />
        </div>

        {/* ORTA: Linkler (md ve üzeri) */}
        <div className="flex-row hidden md:block">
          <SocialLinks />
        </div>

        {/* SAĞ: Masaüstü Connect + Mobil Menü */}
        <div className="flex items-center gap-4 justify-normal">
          {/* Masaüstü: Connect Wallet (Modal açar) */}
          <div className="hidden md:block justify-center mb-1 items-center">
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
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              variant="default"
              pill
              size="icon"
              className="text-brand-secondary-200 focus:outline-none z-50"
            >
              {menuOpen ? (
                <XMarkIcon className="w-8 h-8 z-50" />
              ) : (
                <Bars3Icon className="w-8 h-8" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div
          className="
            fixed
            inset-0
            z-20
            bg-brand-secondary-300/80
            backdrop-blur-md
            flex
            items-center
            justify-center
          "
          onClick={() => setMenuOpen(false)} // Tüm overlay'e tıklanınca menüyü kapat
        >
          {/* İçerik Kartı */}
          <div
            className="
              w-[90%]
              max-w-sm
              bg-brand-secondary-100
              border
              border-brand-primary-950
              rounded-3xl
              p-6
              items-center
              mx-auto
              my-auto
              relative
            "
            onClick={(e) => e.stopPropagation()} // İçerik alanına tıklamaları durdur (menü kapanmasın)
          >
            {/* Menü İçeriği */}
            <div className="flex flex-col items-start gap-2">
              <Button
                className="w-full justify-between"
                icon
                pill
                size="default"
                variant="outline"
                onClick={() => window.open("https://x.com/chozapp", "_blank")}
              >
                X Account
                <img src={X.src} alt="X Logo" className="w-8 h-8" />
              </Button>

              <Button
                className="w-full justify-between"
                icon={false}
                pill
                size="default"
                variant="outline"
                onClick={() => window.open("https://choz.medium.com/", "_blank")}
              >
                Github Docs
                <img src={Github.src} alt="Github Logo" className="w-8 h-8" />
              </Button>
              <Button
                className="w-full justify-between"
                icon={false}
                pill
                size="default"
                variant="outline"
                onClick={() => window.open("https://choz.medium.com/", "_blank")}
              >
                Linkedin
                <img src={Linkedin.src} alt="Linkedin Logo" className="w-8 h-8" />
              </Button>

              <Button
                className="w-full justify-between"
                icon={false}
                pill
                size="default"
                variant="outline"
                onClick={() => window.open("https://choz.medium.com/", "_blank")}
              >
                Medium Blog
                <img src={Medium.src} alt="Medium Logo" className="w-8 h-8" />
              </Button>

              {/* Mobil: Connect Wallet (Modal) */}
              <Button
                className="w-full justify-between"
                icon
                variant="outline"
                pill
                size="default"
                onClick={() => {
                  setMenuOpen(false);
                  openConnectModal();
                }}
              >
                Connect wallet
                <img src={Auro.src} alt="Auro Logo" className="w-8 h-8" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bileşeni (wallet-selector) */}
      <WalletModal isOpen={isConnectModalOpen} onClose={closeConnectModal} />
    </header>
  );
};

Header.propTypes = {
  size: PropTypes.oneOf(["xl"]),
  state: PropTypes.oneOf(["not-connected", "connected"]),
};
