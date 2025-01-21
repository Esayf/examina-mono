// FeaturesSection.tsx
"use client";
import React from "react";
import styles from "@/styles/Landing.module.css";

interface FeatureItem {
  featureTitle: string;
  featureDesc: string;
}

interface FeaturesSectionProps {
  featureArr: FeatureItem[];
}

export function FeaturesSection({ featureArr }: FeaturesSectionProps) {
  return (
    <section className={styles.section_container} aria-label="Features">
      <div className={styles.container}>
        <h2 className={styles.section_title}>OUR FEATURES</h2>
        <h3 className={styles.section_summary}>
          <span>The future of engagement.</span>
        </h3>
        <p className={styles.section_desc}>
          We offer an experience you&apos;ve never used before with our unique features.
        </p>

        {/* 
          Değişiklik: 
          - Önceden 'card_container' olan bölümü, yatay stack oluşturacak
            'feature_card_stack' sınıfına dönüştürdük.
        */}
        <div className={styles.feature_card_stack} role="list">
          {featureArr.map((feature, index) => (
            <div key={index} className={styles.feature_card_container} role="listitem">
              <div className={styles.feature_card_content}>
                <h4 className={styles.feature_card_title}>{feature.featureTitle}</h4>
                <p className={styles.feature_card_desc}>{feature.featureDesc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
