"use client";

import React from "react";
import Image from "next/image";
import SUBCTA from "@/images/backgrounds/bg1.svg";
import styles from "@/styles/Landing.module.css";

interface SubCtaSectionProps {
  handleAuthentication: () => void;
}

export default function SubCtaSection({ handleAuthentication }: SubCtaSectionProps) {
  return (
    <section
      className={`
        ${styles.section_container}
        ${styles.section_container_secondary}
      `}
      aria-label="Call to Action"
    >
      {/* Arka plan resmi */}
      <div className={styles.section_background}>
        <Image
          src={SUBCTA}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
          priority
        />
      </div>

      {/* İçerik */}
      <div className={styles.sub_section_container}>
        <div className={styles.container}>
          {/* 
            TIKLANIR ALAN:
            - onClick doğrudan text_container'da 
            - cursor-pointer stilini de bu div'e veriyoruz 
          */}
          <div
            className={`${styles.sub_section_text_container} ${styles.clickable}`}
            onClick={handleAuthentication}
          >
            <h2>It&apos;s rewarding, it&apos;s engaging, are you ready to dive in?</h2>
          </div>
        </div>
      </div>
    </section>
  );
}
