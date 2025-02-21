"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";

// Örnek görseller (SVG de olabilir)
import Step1Img from "@/../src/images/landing_feature_card/stepp1.svg";
import Step2Img from "@/../src/images/landing_feature_card/stepp2.svg";
import Step3Img from "@/../src/images/landing_feature_card/stepp3.svg";

import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import styles from "@/styles/Landing.module.css";

import session, { SessionSlice, setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "react-hot-toast";

interface Step {
  stepText: string;
  stepTitle: string;
  stepDesc: string;
  stepImg?: StaticImageData | string;
  className?: string;
}

const stepArray: Step[] = [
  {
    stepText: "1",
    stepTitle: "Seamlessly start 🥳",
    stepDesc:
      "Jump right in – no signup needed! Simply press the 'Connect wallet’ button to seamlessly link your Auro Wallet.",
    stepImg: Step1Img,
  },
  {
    stepText: "2",
    stepTitle: "Add your questions 💪",
    stepDesc: "Design your quiz in minutes – choose questions, add rewards, and you’re set!",
    stepImg: Step2Img,
  },
  {
    stepText: "3",
    stepTitle: "Quickly share 🚀",
    stepDesc: "With a single click, your quiz is live and ready to engage your audience!",
    stepImg: Step3Img,
  },
];

interface HowItWorksSectionProps {
  stepArr?: Step[];
  className?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ stepArr = stepArray }) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session);
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
    window.location.href = "/app/dashboard/choose-role";
  };
  return (
    <section className={styles.section_container} aria-label="How it Works">
      <div className={styles.container}>
        <h2 className={styles.section_title}>HOW IT WORKS</h2>
        <h3 className={styles.section_summary}>
          <span>Your quizzes, simplified.</span>
        </h3>

        <div className={styles.card_container} role="list">
          {stepArr.map((step, index) => (
            <div className={styles.usage_card} key={index} role="listitem">
              {step.stepImg && (
                <div className={styles.usage_card_image_container}>
                  <Image
                    src={step.stepImg}
                    alt={step.stepTitle}
                    className={styles.usage_card_image}
                    width={100}
                    height={100}
                    priority={index === 0}
                  />
                </div>
              )}
              <div className="flex flex-col gap 2">
                <div className={styles.usage_card_title_container}>
                  <p className={styles.usage_card_title_step}>{step.stepText}</p>
                  <h4 className={styles.usage_card_title}>{step.stepTitle}</h4>
                </div>
                <div>
                  <p className={styles.usage_card_desc}>{step.stepDesc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.section_button_container}>
          <Link
            href=""
            className={styles.cta_button}
            aria-label="Start creating your first quiz on Choz"
          >
            <Button
              variant="tertiary"
              pill={true}
              size="lg"
              icon={true}
              iconPosition="right"
              className="transition-transform duration-300 hover:scale-105 active:scale-95 hover:bg-brand-tertiary-500 active:bg-brand-tertiary-900"
              onClick={handleAuthentication}
            >
              Create now
              <ArrowUpRightIcon className="size-6" color="brand-primary-950" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
