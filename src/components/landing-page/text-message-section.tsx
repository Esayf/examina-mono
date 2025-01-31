"use client";

import React from "react";
import Image from "next/image";
import CTA from "@/images/backgrounds/text-bg.svg";
import { TypewriterText } from "@/components/ui/typewriter-text";
import styles from "@/styles/Landing.module.css";

export const TextMessageSection = () => {
  return (
    <section
      className={`${styles.section_container} ${styles.section_container_secondary}`}
      aria-label="Value Proposition"
      role="region"
    >
      <div className={styles.text_cta_container}>
        <div className={styles.section_background} aria-hidden="true">
          <Image
            src={CTA}
            alt=""
            className="w-full h-full object-cover"
            width={1440}
            height={600}
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,..."
          />
        </div>
        <div className={styles.text_cta_content}>
          <TypewriterText
            textArray={[
              "Empower your audience",
              "Boost your engagement",
              "Reward your users",
              "Amplify your reach",
              "Elevate participation",
              "Strengthen connections",
              "Maximize user potential",
              "Cultivate loyalty",
            ]}
            className={`${styles.typewriter_text} mb-6`}
          />
          <p className={styles.text_cta_desc}>
            <span className={styles.desktop_text}>
              At Choz, rewards do more than add value. They transform quizzes into exciting,
              competitive experiences. Motivate your team, engage customers or make learning fun.
            </span>
            <span className={styles.mobile_text}>
              Choz rewards transform quizzes into engaging experiences. Motivate, engage, and learn.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
