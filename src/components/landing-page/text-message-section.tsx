"use client";

import React from "react";
import Image from "next/image";
import CTA from "@/images/backgrounds/background-text.svg"; // Bu yol örnek, kendi projenize göre güncelleyin
import { TypewriterText } from "@/components/ui/typewriter-text"; // TypewriterText'in yolu
import styles from "@/styles/Landing.module.css"; // CSS dosyanızın yolu

export const TextMessageSection = () => {
  return (
    <section
      className={`${styles.section_container} ${styles.section_container_secondary}`}
      aria-label="Value Proposition"
    >
      <div className={styles.text_cta_container}>
        <div className={styles.section_background}>
          <Image src={CTA} alt="CTA Background" className="w-full h-full object-cover" />
        </div>
        <div className={styles.text_cta_content}>
          <TypewriterText
            textArray={["Empower your audience", "Boost your engagement", "Reward your users"]}
          />
          <h3 className={styles.text_cta_desc}>
            At Choz, rewards do more than add value. They transform quizzes into exciting,
            competitive experiences. Motivate your team, engage customers or make learning fun.
          </h3>
        </div>
      </div>
    </section>
  );
};
