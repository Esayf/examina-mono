// Section4.tsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SparklesIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

import BG from "@/../src/images/backgrounds/bg3.png";
import styles from "@/styles/Landing.module.css";
import tikicon from "@/images/landing_general/mini-icon.svg";

/**
 * Tek tek kart bilgilerini tutan tip
 */
interface TechProps {
  techTitle: string;
  techDesc: string;
  techLink: string;
}

/**
 * Bileşenin tamamına verilecek props (ör. techArr)
 */
interface TechSectionProps {
  techArr: TechProps[];
}

export default function TechSection({ techArr }: TechSectionProps) {
  return (
    <section
      className={`${styles.section_container} ${styles.section_container_secondary}`}
      aria-label="Technologies"
    >
      <div className={styles.section_container_secondary}>
        <h2 className={styles.section_title}>OUR TECHNOLOGIES</h2>
        <h3 className={styles.section_summary}>
          <span>We use these techs.</span>
        </h3>
        <p className={styles.section_desc}>
          With our cutting-edge technologies, we deliver a secure, fast, and modern experience.
        </p>

        {/* Kartları tutan container */}
        <div className={styles.tech_card_container} role="list">
          <div className={styles.tech_card_grid}>
            {techArr.map((tech, index) => (
              <div key={index} className={styles.tech_card} role="listitem">
                {/* Kart içeriği */}
                <Link
                  href={tech.techLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read detailed article about ${tech.techTitle} technology in Choz`}
                >
                  <div className="flex flex-row justify-between gap-4">
                    <div className="mt-2 min-h-[24px] hidden lg:block">
                      <Image src={tikicon} height={36} width={36} alt="Icon" />
                    </div>
                    <div className={styles.tech_card_text_container}>
                      <h4 className={styles.tech_card_title}>{tech.techTitle}</h4>
                      <p className={styles.tech_card_desc}>{tech.techDesc}</p>
                    </div>
                    <div className={styles.tech_card_link_container}>
                      <ArrowUpRightIcon className="size-20 z-[-10]" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
