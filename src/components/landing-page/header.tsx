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
    toast.success("Welcome back!");
    dispatch(setSession(res.session));
    window.location.href = "/app";
  };

  return (
    <div className={`${styles.header} bg-white border-b border-gray-200`}>
      <div className={`${styles.header_container} w-full mx-auto flex items-center justify-between`}>
        {/* Logo */}
        <div className={`${styles.logo_container}`} style={{ maxHeight: "50px", width: "175.81px" }}>
          <Image src={Choz} height={36} alt="Choz Logo" />
        </div>

        {/* Navigation for large screens */}
        <div className="navbar_container">
          <div className="flex gap-4">
          <Button
            className={`${styles.nav_button} hidden md:block`}
            icon={false}
            pill={false}
            size="default"
            variant="link"
            onClick={() => window.open("https://github.com/Esayf", "_blank")}
          >
            Docs
          </Button>
          <Button
            className={`${styles.nav_button} hidden md:block`}
            icon={false}
            pill={false}
            size="default"
            variant="link"
            onClick={() => window.open("https://choz.medium.com/", "_blank")}
          >
              Blog
            </Button>
          </div>
        </div>
        <div className="flex gap-4 hidden md:block">
          <Button
            iconPosition="right"
            icon={true}
            variant="outline"
            pill
            size="default"
            onClick={handleAuthentication}
          >
            Connect wallet <ArrowUpRightIcon className="w-4 h-4 hidden md:block" />
          </Button>
        </div>
         <div className="md:hidden flex items-center">
            <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
              {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col items-start p-4 gap-4">
            <Button
              className={`${styles.nav_button} w-full text-left`}
              icon={false}
              pill={false}
              size="default"
              variant="link"
              onClick={() => window.open("https://github.com/Esayf", "_blank")}
            >
              Docs
            </Button>
            <Button
              className={`${styles.nav_button} w-full text-left`}
              icon={false}
              pill={false}
              size="default"
              variant="link"
              onClick={() => window.open("https://choz.medium.com/", "_blank")}
            >
              Blog
            </Button>
            <Button
              className="w-full text-left"
              icon={false}
              variant="outline"
              pill
              size="default"
              onClick={handleAuthentication}
            >
                Connect wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Header.propTypes = {
  size: PropTypes.oneOf(["xl"]),
  state: PropTypes.oneOf(["not-connected"]),
};
