"use client";

import React, { useState } from "react";
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
      "Jump right in – no signup needed! Simply press the 'Connect wallet' button to seamlessly link your Auro Wallet.",
    stepImg: Step1Img,
  },
  {
    stepText: "2",
    stepTitle: "Add your questions 💪",
    stepDesc: "Design your quiz in minutes – choose questions, add rewards, and you're set!",
    stepImg: Step2Img,
  },
  {
    stepText: "3",
    stepTitle: "Quickly share 🚀",
    stepDesc: "With a single click, your quiz is live and ready to engage your audience!",
    stepImg: Step3Img,
  },
];

const participantSteps: Step[] = [
  {
    stepText: "1",
    stepTitle: "Join instantly 🎉",
    stepDesc: "Connect with one click and play instantly—no registration needed.",
    stepImg: Step1Img,
  },
  {
    stepText: "2",
    stepTitle: "Play & Earn 💰",
    stepDesc:
      "Earn MINA tokens instantly for correct answers—rewards sent directly to your wallet.",
    stepImg: Step2Img,
  },
  {
    stepText: "3",
    stepTitle: "Track Progress 📈",
    stepDesc:
      "Track your quiz history and earnings in real-time through your personalized dashboard.",
    stepImg: Step3Img,
  },
];

interface HowItWorksSectionProps {
  stepArr?: Step[];
  className?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ stepArr = stepArray }) => {
  const [isCreatorView, setIsCreatorView] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
          <span>
            {isCreatorView ? "Your quizzes, simplified." : "Your experience, streamlined."}
          </span>
        </h3>

        <div className={styles.section_button_container}>
          <div className="flex gap-4 mb-4 mt-8 rounded-full bg-brand-secondary-100 p-1.5 outline outline-2 outline-brand-secondary-200">
            <button
              onClick={() => {
                if (!isCreatorView) {
                  setIsTransitioning(true);
                  setTimeout(() => setIsCreatorView(true), 10);
                }
              }}
              className={`px-8 py-3 rounded-full transition-all duration-300 ${
                isCreatorView
                  ? "bg-brand-primary-950 text-brand-secondary-300 shadow-lg scale-100 font-bold"
                  : "bg-brand-secondary-100 text-brand-primary-900 hover:bg-brand-secondary-200/80 scale-95 hover:scale-[1.02]"
              } transform-gpu`}
              aria-selected={isCreatorView}
              role="tab"
            >
              Creator
            </button>
            <button
              onClick={() => {
                if (isCreatorView) {
                  setIsTransitioning(true);
                  setTimeout(() => setIsCreatorView(false), 10);
                }
              }}
              className={`px-8 py-3 rounded-full transition-all duration-300 ${
                !isCreatorView
                  ? "bg-brand-primary-950 text-brand-secondary-300 shadow-lg scale-100 font-bold"
                  : "bg-brand-secondary-100 text-brand-primary-900 hover:bg-brand-secondary-200/80 scale-95 hover:scale-[1.02]"
              } transform-gpu`}
              aria-selected={!isCreatorView}
              role="tab"
            >
              Participant
            </button>
          </div>
        </div>

        <div className="relative min-h-[80vh-100px]">
          <div
            className={`${styles.card_container} ${
              isTransitioning ? styles.leaving : styles.entering
            }`}
            role="list"
            onTransitionEnd={() => setIsTransitioning(false)}
          >
            {(isCreatorView ? stepArr : participantSteps).map((step, index) => (
              <div
                className={`${styles.usage_card} group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                key={index}
                role="listitem"
              >
                {step.stepImg && (
                  <div
                    className={`${styles.usage_card_image_container} transition-transform duration-300 group-hover:scale-105`}
                  >
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
                <div className="flex flex-col gap-2">
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
              className={`transition-transform duration-300 hover:scale-105 active:scale-95 ${
                isCreatorView
                  ? "hover:bg-brand-tertiary-500 active:bg-brand-tertiary-900"
                  : "bg-brand-primary-400 hover:bg-brand-primary-500 active:bg-brand-primary-900"
              }`}
              onClick={handleAuthentication}
            >
              {isCreatorView ? "Create now" : "Start joining"}
              <ArrowUpRightIcon className="size-6" color="brand-primary-950" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
