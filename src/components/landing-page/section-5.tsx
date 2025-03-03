"use client";
import React from "react";
import Image from "next/image";
import styles from "@/styles/HeroChozFeatures.module.css";
import BGR from "@/images/backgrounds/bg1.svg";

/**
 * Example data for floating, animated items
 */
const floatingFeatures = [
  {
    id: 1,
    text: "#Fast 🚀",
    imageSrc: "/images/fast-icon.svg", // Replace with your actual icon/image
    style: styles.item1,
    bubbleStyle: styles.bubble1,
  },
  {
    id: 2,
    text: "#Secure 🔒",
    imageSrc: "/images/secure-icon.svg",
    style: styles.item2,
    bubbleStyle: styles.bubble2,
  },
  {
    id: 3,
    text: "#Rewarding 💰",
    imageSrc: "/images/reward-icon.svg",
    style: styles.item3,
    bubbleStyle: styles.bubble3,
  },
  {
    id: 4,
    text: "#Free 🆓",
    imageSrc: "/images/free-icon.svg",
    style: styles.item4,
    bubbleStyle: styles.bubble4,
  },
  {
    id: 5,
    text: "#Private 🔒",
    imageSrc: "/images/private-icon.svg",
    style: styles.item5,
    bubbleStyle: styles.bubble5,
  },
  {
    id: 6,
    text: "#Fun 🎉",
    imageSrc: "/images/fun-icon.svg",
    style: styles.item6,
    bubbleStyle: styles.bubble6,
  },
  {
    id: 7,
    text: "#Easy 🤗",
    imageSrc: "/images/easy-icon.svg",
    style: styles.item7,
    bubbleStyle: styles.bubble7,
  },
  {
    id: 8,
    text: "#Private 🔒",
    imageSrc: "/images/private-icon.svg",
    style: styles.item8,
    bubbleStyle: styles.bubble8,
  },
];

export default function HeroChozFeatures() {
  return (
    <section className={styles.heroContainer}>
      {/* Background image */}
      <div className={styles.hero_bg}>
        <Image src={BGR} alt="Hero Background" fill className="object-cover w-full h-full" />
      </div>

      {/* Floating, animated feature items */}
      {floatingFeatures.map((feature) => (
        <div key={feature.id} className={`${styles.floatingItem} ${feature.style}`}>
          <div className={`${styles.featureBubble} ${feature.bubbleStyle}`}>
            <span>{feature.text}</span>
          </div>
        </div>
      ))}

      {/* Central hero content */}
      <div className={styles.heroContent}>
        <p className={styles.heroSubtitle}>
          Harness <strong>zero-knowledge proofs</strong> for unstoppable, private, and rewarding
          blockchain-based assessments.
        </p>
      </div>
    </section>
  );
}
