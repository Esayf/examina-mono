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

interface HeaderProps {
  size: string;
  state: "not-connected" | "connected";
}

export const Header = ({ size, state }: HeaderProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header
      className={`
        ${styles.header} 
        bg-brand-secondary-100 
        border-b border-brand-secondary-100
      `}
    >
      {/* İçerik kapsayıcı: logo - linkler - buton(lar) */}
      <div
        className={`
          ${styles.header_container} 
          w-full 
          mx-auto 
          flex 
          items-center 
          px-4 
          /* justify-between'i kaldırıyoruz, 
             onun yerine 3 bölümlü layout yapacağız */
        `}
      >
        {/* SOL: Logo */}
        <div
          className={`${styles.logo_container} flex-shrink-0`}
          style={{ maxHeight: "50px", width: "175.81px" }}
        >
          <Image src={Choz} height={36} alt="Choz Logo" />
        </div>

        {/* ORTA: Linkler (sadece md ve üzeri) */}
        <nav
          className={`
            hidden 
            md:flex 
            flex-1 
            items-center 
            justify-center 
            gap-6
          `}
        >
          <Button
            className={styles.nav_button}
            icon={false}
            pill={false}
            size="default"
            variant="link"
            onClick={() => window.open("https://github.com/Esayf", "_blank")}
          >
            Docs
          </Button>
          <Button
            className={styles.nav_button}
            icon={false}
            pill={false}
            size="default"
            variant="link"
            onClick={() => window.open("https://x.com/chozapp", "_blank")}
          >
            X (Twitter)
          </Button>
          <Button
            className={styles.nav_button}
            icon={false}
            pill={false}
            size="default"
            variant="link"
            onClick={() => window.open("https://www.linkedin.com/company/chozapp", "_blank")}
          >
            LinkedIn
          </Button>
          <Button
            className={styles.nav_button}
            icon={false}
            pill={false}
            size="default"
            variant="link"
            onClick={() => window.open("https://choz.medium.com/", "_blank")}
          >
            Blog
          </Button>
        </nav>

        {/* SAĞ: Connect Wallet butonu (md ve üzeri) + Hamburger (md altı) */}
        <div className="flex items-center gap-4 ml-4">
          {/* CONNECT WALLET (masaüstünde gözüksün) */}
          <div className="hidden md:block">
            <Button
              iconPosition="right"
              icon
              variant="outline"
              pill
              size="default"
              onClick={handleAuthentication}
            >
              Connect wallet
              <ArrowUpRightIcon className="w-5 h-5 hidden md:block" />
            </Button>
          </div>

          {/* HAMBURGER (Sadece mobilde - md:hidden) */}
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

      {/* MOBİL MENÜ (md altında açılan) */}
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
            bg-brand-primary-400 
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
            <Button
              className="w-full bg-brand-secondary-200 text-brand-primary-950"
              icon
              variant="default"
              pill
              size="default"
              onClick={handleAuthentication}
            >
              Connect
              <ArrowUpRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  size: PropTypes.oneOf(["xl"]),
  state: PropTypes.oneOf(["not-connected"]),
};
