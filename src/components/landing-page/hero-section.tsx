"use client";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";

import { useEffect, useState, MouseEvent, useCallback } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { AnimatePresence, motion, animate, stagger, useAnimate } from "framer-motion";

import styles from "../../styles/Landing.module.css";
import BGR from "@/images/backgrounds/hero-section.svg";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// React Icons (Discord, Twitter vb.)
import { FaDiscord, FaTwitter, FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

// Kopyalanabilir link + QR Code (örnek)
import { CopyLink } from "@/components/ui/copylink";
import { QRCodeCanvas } from "qrcode.react";

/* -----------------------------------------------
   1) heroTitles (liste)
----------------------------------------------- */
const heroTitles = [
  // Mevlana'dan Esintiler
  "#Choz to see the candle in every heart's darkness",
  "#Choz to dance beyond the illusion of separation",
  "#Choz to be a mirror polishing reflections",
  "#Choz to love without demanding understanding",
  "#Choz to find the sunrise in every ending",

  // Budist Öğretiler
  "#Choz to observe thoughts like passing clouds",
  "#Choz to water the seeds of compassion daily",
  "#Choz to walk the middle path between extremes",
  "#Choz to hold joy and sorrow with equal grace",
  "#Choz to be the calm beneath life's monsoon",

  // Varoluşsal Birlik
  "#Choz to hear the universe in a dewdrop's fall",
  "#Choz to find yourself in strangers' stories",
  "#Choz to weave connection from life's fragments",
  "#Choz to be both the river and the shore",
  "#Choz to taste eternity in this breath",

  // Günlük Pratikler
  "#Choz to greet each morning as a blank page",
  "#Choz to listen with the earth's patience",
  "#Choz to speak words that grow gardens",
  "#Choz to transform routine into ritual",
  "#Choz to find nirvana in washing dishes",

  // Modern İkilemler
  "#Choz to disconnect and rediscover presence",
  "#Choz to choose wonder over scrolling",
  "#Choz to answer hate with radical curiosity",
  "#Choz to find stillness in motion",
  "#Choz to be human in a digital age",

  // Evrensel Öğretiler
  "#Choz to honor the teacher in every encounter",
  "#Choz to carry light without casting shadows",
  "#Choz to be the bridge your younger self needed",
  "#Choz to fail like mountains weather storms",
  "#Choz to leave every place softer than you found it",

  // Temel İnsani Değerler
  "#Choz to choose kindness when it's harder",
  "#Choz to find strength in quiet integrity",
  "#Choz to leave places better than you found them",

  // Karar Ahlakı
  "#Choz to weigh consequences before acting",
  "#Choz to see the human behind every choice",
  "#Choz to plant trees whose shade you'll never see",

  // Günlük Erdemler
  "#Choz to practice courage in small truths",
  "#Choz to honor promises made to yourself",
  "#Choz to find nobility in ordinary acts",

  // Sosyal Sorumluluk
  "#Choz to be why someone believes in good",
  "#Choz to carry burdens without being asked",
  "#Choz to speak up when silence costs too much",

  // İçsel Yolculuk
  "#Choz to confront the mirrors within",
  "#Choz to make peace with your shadows",
  "#Choz to forgive yesterday's versions of yourself",

  // Varoluşsal Sorular
  "#Choz to build bridges when walls are expected",
  "#Choz to find light without dimming others'",
  "#Choz to question what's 'normal' courageously",

  // Stoacı Yaklaşımlar
  "#Choz to focus on what you can control",
  "#Choz to meet chaos with composed purpose",
  "#Choz to find freedom in voluntary constraints",

  // Evrensel İlkeler
  "#Choz to treat strangers as future friends",
  "#Choz to err on the side of radical empathy",
  "#Choz to let your actions outlive your words",

  // Modern İkilemler
  "#Choz to disconnect to reconnect authentically",
  "#Choz to consume less but experience more",
  "#Choz to value presence over perfection",

  // Nesiller Arası Bilgelik
  "#Choz to honor elders by asking better questions",
  "#Choz to plant seeds for forests you'll never see",
  "#Choz to break cycles that no longer serve life",

  // Motivational Wisdom
  "#Choz to embrace failure as your teacher",
  "#Choz to take small steps when the path seems long",
  "#Choz to celebrate progress, not just perfection",
  "#Choz to find strength in vulnerable moments",
  "#Choz to write your story with bold strokes",

  // Daily Inspiration
  "#Choz to begin again with renewed purpose",
  "#Choz to turn obstacles into stepping stones",
  "#Choz to find joy in the journey, not the destination",
  "#Choz to light a candle instead of cursing darkness",
  "#Choz to be the energy you want to attract",

  // Personal Growth
  "#Choz to grow through what you go through",
  "#Choz to trust the timing of your life",
  "#Choz to become comfortable with discomfort",
  "#Choz to replace 'what if' with 'let's try'",
  "#Choz to water your garden before judging others'",

  // Resilience
  "#Choz to bend without breaking in life's storms",
  "#Choz to rise after every fall with new wisdom",
  "#Choz to find your voice when silence feels safer",
  "#Choz to rebuild with stronger foundations",
  "#Choz to transform pain into purpose",
];

/* -----------------------------------------------
   2) getShareMessage: Paylaşım metni
----------------------------------------------- */
function getShareMessage(quote: string) {
  return `🚀 Check out my #Choz Wisdom! 🚀

"${quote}"

Join me in using #Choz to find a daily dose of positivity & motivation! 

https://choz.io
`;
}

/* -----------------------------------------------
   3) ShareModal Bileşeni - Refactored
----------------------------------------------- */
function ShareModal({
  isOpen,
  onClose,
  quote,
}: {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
}) {
  if (!isOpen) return null;
  const shareMessage = getShareMessage(quote);

  // Consolidated share functions with a common handler
  const handleShare = async (action: "copy" | "twitter" | "whatsapp" | "telegram") => {
    const text = encodeURIComponent(shareMessage);

    switch (action) {
      case "copy":
        try {
          await navigator.clipboard.writeText(shareMessage);
          toast.success("Copied to clipboard!");
        } catch {
          toast.error("Failed to copy!");
        }
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
        break;
      case "telegram":
        window.open(`https://t.me/share/url?url=&text=${text}`, "_blank");
        break;
    }
  };

  const handleShareDiscord = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Copied! Now open Discord and paste it.");
    } catch {
      toast.error("Failed to copy!");
    }
  };

  // Social media button component to reduce repetition
  const SocialButton = ({
    onClick,
    icon: Icon,
    label,
  }: {
    onClick: () => void;
    icon: React.ComponentType<any>;
    label: string;
  }) => (
    <button onClick={onClick} className="icon-button">
      <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
        <Icon className="text-xl" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white w-[90%] max-w-md rounded-3xl p-6 border border-greyscale-light-200 relative"
      >
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-greyscale-light-300 hover:text-gray-600 p-2 transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-4">Share your inspiration</h3>
        {/* Metin kutusu */}
        <div className="mb-6 bg-brand-secondary-100 p-3 rounded-2xl border border-greyscale-light-300 text-base text-brand-primary-900 whitespace-pre-wrap">
          {shareMessage}
        </div>

        {/* Paylaşım ikonları */}
        <div className="flex justify-center items-center flex-wrap gap-5 mb-6">
          <SocialButton onClick={handleShareDiscord} icon={FaDiscord} label="Discord" />
          <SocialButton onClick={() => handleShare("twitter")} icon={FaTwitter} label="Twitter" />
          <SocialButton
            onClick={() => handleShare("whatsapp")}
            icon={FaWhatsapp}
            label="WhatsApp"
          />
          <SocialButton
            onClick={() => handleShare("telegram")}
            icon={FaTelegramPlane}
            label="Telegram"
          />
        </div>

        {/* Copy Message butonu */}
        <div className="mb-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => handleShare("copy")}
            className="flex items-center gap-2"
          >
            Copy Message
            <DocumentDuplicateIcon className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* -----------------------------------------------
   4) HeroSection Bileşeni - Refactored
----------------------------------------------- */
interface HeroSectionProps {
  hasTopButton?: boolean;
  hasBackgroundPattern?: boolean;
}

export function HeroSection({
  hasTopButton = true,
  hasBackgroundPattern = true,
}: HeroSectionProps) {
  // Redux state
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  // State management
  const [randomHeroTitle, setRandomHeroTitle] = useState("");
  const [titleKey, setTitleKey] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [finalChoice, setFinalChoice] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Animation variants
  const finalVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    final: {
      opacity: 1,
      y: 0,
      scale: [1, 1.1, 1],
      rotate: [0, -2, 2, -2, 0],
      transition: {
        duration: 0.8,
        scale: { duration: 0.4 },
        rotate: { duration: 0.6 },
      },
    },
  };

  // Initialize with default title
  useEffect(() => {
    setRandomHeroTitle("#Choz to turn quizzes into rewarding experiences");
  }, []);

  // Helper functions
  const shuffleTitle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * heroTitles.length);
    setRandomHeroTitle(heroTitles[randomIndex]);
    setTitleKey((prev) => prev + 1);
  }, []);

  const handleShuffleDailyInspiration = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setFinalChoice(false);
      setIsShuffling(true);

      // Shuffle animation
      const intervalId = setInterval(shuffleTitle, 50);

      // Stop shuffling after 2.5 seconds
      setTimeout(() => clearInterval(intervalId), 2500);

      // Show final choice after 3 seconds
      setTimeout(() => {
        shuffleTitle();
        setIsShuffling(false);
        setFinalChoice(true);
        toast.success("Perfect choice! Ready to share?", {
          icon: "🎉",
          duration: 2000,
        });
      }, 3000);
    },
    [shuffleTitle]
  );

  // Button text and styling
  const getButtonText = () => {
    if (isShuffling) return "Shuffling...";
    if (finalChoice) return "Share your #Choz";
    return "Shuffle your #Choz";
  };

  const getButtonClass = () => {
    const baseClasses = "transition-transform duration-300 hover:scale-105 active:scale-95";

    return finalChoice
      ? `bg-brand-secondary-100 hover:bg-brand-secondary-100 text-brand-primary-900 ${baseClasses}`
      : `hover:bg-brand-secondary-100 ${baseClasses}`;
  };

  // Button click handlers
  const handleButtonClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (finalChoice) {
        setIsShareModalOpen(true);
      } else {
        handleShuffleDailyInspiration(e);
      }
    },
    [finalChoice, handleShuffleDailyInspiration]
  );

  const handleAuthentication = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const res = await authenticate(session);
    if (!res) {
      toast.error("Failed to authenticate wallet!");
      return;
    }
    toast.success("Welcome back!", { duration: 5000 });
    dispatch(setSession(res.session));
    // Redirect
    window.location.href = "/app/dashboard/choose-role";
  };

  return (
    <section className={styles.hero_section}>
      {/* Background */}
      {hasBackgroundPattern && (
        <div className={styles.hero_bg}>
          <Image src={BGR} alt="Hero Background" fill className="w-full h-full object-cover" />
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            quote={randomHeroTitle}
          />
        )}
      </AnimatePresence>

      <div className={`${styles.hero_container} px-4 sm:px-6 lg:px-8`}>
        <div className={`${styles.hero_content_container} max-w-7xl mx-auto`}>
          <h5 className={`${styles.hero_summary} text-sm sm:text-base md:text-lg`}>
            The future of quiz creation is almost here with ChozAI's AI technology 🚀
          </h5>

          <div className="relative min-h-[120px] sm:min-h-[150px] md:min-h-[180px] flex items-center justify-center text-center overflow-hidden whitespace-normal leading-normal px-2 sm:px-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={titleKey}
                className={`${styles.hero_title} text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${
                  finalChoice ? "text-brand-primary-800" : "text-current"
                }`}
                variants={finalVariants}
                initial="initial"
                animate={finalChoice ? "final" : "animate"}
                exit="exit"
              >
                {randomHeroTitle}
              </motion.h1>
            </AnimatePresence>
          </div>

          <h3 className={`${styles.hero_desc} text-sm sm:text-base md:text-lg max-w-3xl mx-auto`}>
            Create engaging quizzes, reward participants, and transform learning experiences with
            our powerful platform.
          </h3>

          {hasTopButton && (
            <div className="flex flex-col gap-4 mt-6 sm:mt-8 md:flex-row justify-center">
              <Button
                variant="secondary"
                size="lg"
                className={`${getButtonClass()} w-full sm:w-auto`}
                onClick={handleButtonClick}
                disabled={isShuffling}
              >
                {getButtonText()}
                {finalChoice && <ShareIcon className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
              </Button>

              <Button
                variant="tertiary"
                size="lg"
                className="w-full sm:w-auto hover:bg-brand-tertiary-500 transition-transform duration-300 hover:scale-105 active:scale-95"
                icon={false}
                onClick={handleAuthentication}
                disabled={false}
              >
                Create your first quiz
                <ArrowUpRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
