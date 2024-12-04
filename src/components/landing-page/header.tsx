"use client";
import PropTypes from "prop-types";
import React from "react";
import { Button } from "@/components/ui/button";
import Choz from "@/images/landing-header/logo-type.svg";
import styles from "@/styles/Landing.module.css";
import { toast } from "react-hot-toast";
import session, { setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";
import { useAppDispatch } from "@/app/hooks";
import Image from "next/image";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  size: string;
  state: "not-connected" | "connected";
}
export const Header = ({ size, state }: HeaderProps): JSX.Element => {
  const dispatch = useAppDispatch();
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
    <div className={styles.header}>
      <div className={styles.header_container}>
        <div className={styles.logo_container}>
          <Image src={Choz} height={50} width={100} alt="Choz Logo" />
        </div>

        <div className={styles.navigation_container}>
          <div>
            <Button
              className={styles.nav_button}
              icon={false}
              pill={false}
              size="default"
              variant="link"
              onClick={() => {
                window.open("https://github.com/Esayf", "_blank");
              }}
            >
              Docs
            </Button>
            <Button
              className={styles.nav_button}
              icon={false}
              pill={false}
              size="default"
              variant="link"
              onClick={() => {
                window.open("https://choz.medium.com/", "_blank");
              }}
            >
              Blog
            </Button>
          </div>
        </div>
        <Button
          iconPosition="right"
          icon={true}
          variant="outline"
          pill
          size="default"
          onClick={handleAuthentication}
        >
          Connect wallet <ArrowUpRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

Header.propTypes = {
  size: PropTypes.oneOf(["xl"]),
  state: PropTypes.oneOf(["not-connected"]),
};
