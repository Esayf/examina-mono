"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";

// Örnek görseller (SVG de olabilir)
import Step1Img from "@/../src/images/landing_feature_card/step-1 1.svg";
import Step2Img from "@/../src/images/landing_feature_card/step-2 1.svg";
import Step3Img from "@/../src/images/landing_feature_card/step-3 1.svg";

import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import styles from "@/styles/Landing.module.css";

import session, { SessionSlice, setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";
import { useAppDispatch } from "@/app/hooks";
import { toast } from "react-hot-toast";

interface Step {
  stepText: string;
  stepTitle: string;
  stepDesc: string;
  // Hem string (URL) hem de StaticImageData desteği
  stepImg?: StaticImageData | string;
  className?: string;
}

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

const stepArray: Step[] = [
  {
    stepText: "STEP 1",
    stepTitle: "Seamlessly start 🥳",
    stepDesc:
      "Jump right in – no signup needed! Simply press the 'Connect wallet’ button to seamlessly link your Auro Wallet.",
    stepImg: Step1Img,
  },
  {
    stepText: "STEP 2",
    stepTitle: "Add your questions 💪",
    stepDesc: "Design your quiz in minutes – choose questions, add rewards, and you’re set!",
    stepImg: Step2Img,
  },
  {
    stepText: "STEP 3",
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
  return (
    <section className={styles.section_container} aria-label="How it Works">
      <div className={styles.container}>
        <h2 className={styles.section_title}>HOW IT WORKS</h2>
        <h3 className={styles.section_summary}>
          <span>Your quizzes, simplified.</span>
        </h3>
        <p className={styles.section_desc}>
          Whether for training, customer engagement, or pure fun, Choz brings together everything
          you need for a seamless and impactful quiz experience.
        </p>

        <div className={styles.card_container} role="list">
          {stepArr.map((step, index) => (
            <div className={styles.usage_card} key={index} role="listitem">
              {/* Resmi burada render ediyoruz */}
              {step.stepImg && (
                <div className={styles.usage_card_image_container}>
                  <Image
                    src={step.stepImg}
                    alt={step.stepTitle}
                    className={styles.usage_card_image}
                    // width / height veya fill
                    width={100}
                    height={100}
                    priority={index === 0} // ilkini öncelikli yüklemek için
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
              className="    transition-transform
    duration-300
    hover:scale-105
    active:scale-95"
              onClick={async () => {
                const res = await authenticate(session);
                if (!res) {
                  toast.error("Failed to authenticate wallet!");
                  return;
                }
                toast.success("Successfully authenticated wallet!");
                dispatch(setSession(res));
              }}
            >
              Create now
              <ArrowUpRightIcon className="size-6" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
function dispatch(arg0: { payload: SessionSlice; type: "session/setSession" }) {
  throw new Error("Function not implemented.");
}
