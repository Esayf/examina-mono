"use client";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";

import { useEffect, useState, MouseEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { AnimatePresence, motion, animate, stagger, useAnimate } from "framer-motion";

import styles from "../../styles/Landing.module.css";
import BGR from "@/images/backgrounds/bg-5.svg";
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
  "#Choz to be a mirror polishing its own reflections",
  "#Choz to love without demanding to be understood",
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
  "#Choz to choose kindness when it's easier not to",
  "#Choz to find strength in quiet integrity",
  "#Choz to leave every place better than you found it",

  // Karar Ahlakı
  "#Choz to weigh consequences before acting",
  "#Choz to see the human behind every choice",
  "#Choz to plant trees whose shade you'll never enjoy",

  // Günlük Erdemler
  "#Choz to practice courage in small truths",
  "#Choz to honor promises made to yourself",
  "#Choz to find nobility in ordinary acts",

  // Sosyal Sorumluluk
  "#Choz to be the reason someone believes in good",
  "#Choz to carry others' burdens without being asked",
  "#Choz to speak up when silence costs too much",

  // İçsel Yolculuk
  "#Choz to confront the mirrors within",
  "#Choz to make peace with your shadows",
  "#Choz to forgive yesterday's versions of yourself",

  // Varoluşsal Sorular
  "#Choz to build bridges when walls are expected",
  "#Choz to find light without extinguishing others'",
  "#Choz to question what's 'normal' courageously",

  // Stoacı Yaklaşımlar
  "#Choz to focus on what's within your circle of control",
  "#Choz to meet chaos with composed purpose",
  "#Choz to find freedom in voluntary constraints",

  // Evrensel İlkeler
  "#Choz to treat strangers as future friends",
  "#Choz to err on the side of radical empathy",
  "#Choz to let your actions outlive your words",

  // Modern İkilemler
  "#Choz to disconnect to reconnect authentically",
  "#Choz to consume less but experience more",
  "#Choz to value being present over being perfect",

  // Nesiller Arası Bilgelik
  "#Choz to honor elders by asking better questions",
  "#Choz to plant seeds for forests you'll never see",
  "#Choz to break cycles that no longer serve life",
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
   3) ShareModal Bileşeni
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

  // -- Paylaşım Fonksiyonları --
  const handleShareDiscord = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Copied! Now open Discord and paste it.");
    } catch {
      toast.error("Failed to copy!");
    }
  };
  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };
  const handleShareTelegram = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://t.me/share/url?url=&text=${text}`, "_blank");
  };
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy!");
    }
  };

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
          <button onClick={handleShareDiscord} className="icon-button">
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaDiscord className="text-xl" />
            </div>
            <span className="text-xs font-medium">Discord</span>
          </button>

          <button onClick={handleShareTwitter} className="icon-button">
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaTwitter className="text-xl" />
            </div>
            <span className="text-xs font-medium">Twitter</span>
          </button>

          <button onClick={handleShareWhatsApp} className="icon-button">
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaWhatsapp className="text-xl" />
            </div>
            <span className="text-xs font-medium">WhatsApp</span>
          </button>

          <button onClick={handleShareTelegram} className="icon-button">
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaTelegramPlane className="text-xl" />
            </div>
            <span className="text-xs font-medium">Telegram</span>
          </button>
        </div>

        {/* Copy Message butonu */}
        <div className="mb-6 flex justify-center">
          <Button variant="outline" onClick={handleCopyMessage} className="flex items-center gap-2">
            Copy Message
            <DocumentDuplicateIcon className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* -----------------------------------------------
   4) HeroSection Bileşeni (limit kalktı!)
----------------------------------------------- */
interface HeroSectionProps {
  hasTopButton?: boolean;
  hasBackgroundPattern?: boolean;
}

export function HeroSection({
  hasTopButton = true,
  hasBackgroundPattern = true,
}: HeroSectionProps) {
  // Örnek session
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  // Rastgele cümle durumu
  const [randomHeroTitle, setRandomHeroTitle] = useState("");
  const [titleKey, setTitleKey] = useState(0);

  // Shuffle animasyonu
  const [isShuffling, setIsShuffling] = useState(false);
  const [finalChoice, setFinalChoice] = useState(false);

  // Share Modal durumu
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Framer Motion varyantları
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

  /* -----------------------------------------
     4.1. İlk mount'ta varsayılan title
  ----------------------------------------- */
  useEffect(() => {
    // İstediğiniz herhangi bir varsayılan cümle
    setRandomHeroTitle("#Choz to turn quizzes into rewarding experiences");
  }, []);

  /* -----------------------------------------
     4.2. Rastgele cümle seçmek
  ----------------------------------------- */
  const shuffleTitle = () => {
    const randomIndex = Math.floor(Math.random() * heroTitles.length);
    setRandomHeroTitle(heroTitles[randomIndex]);
    setTitleKey((prev) => prev + 1);
  };

  /* -----------------------------------------
     4.3. Shuffle tıklanınca
  ----------------------------------------- */
  const handleShuffleDailyInspiration = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFinalChoice(false);
    setIsShuffling(true);

    // Hızlı göz kırpma efekti (50ms'de bir değişim)
    const intervalId = setInterval(shuffleTitle, 50);

    // 3sn sonra yavaşlayarak durma efekti
    setTimeout(() => clearInterval(intervalId), 2500); // Hızlı değişim süresi

    // Toplam 3sn sonra final seçimi
    setTimeout(() => {
      shuffleTitle();
      setIsShuffling(false);
      setFinalChoice(true);
      toast.success("Perfect choice! Ready to share?", {
        icon: "🎉",
        duration: 2000,
      });
    }, 3000);
  };

  /* -----------------------------------------
     4.4. Buton text vs
  ----------------------------------------- */
  const getButtonText = () => {
    if (isShuffling) return "Shuffling...";
    if (finalChoice) return "Share your #Choz";
    return "Shuffle your #Choz";
  };

  const getButtonClass = () => {
    if (finalChoice) {
      return `
        bg-brand-secondary-100
        hover:bg-brand-secondary-100
        text-brand-primary-900
        transition-transform
        duration-300
        hover:scale-105
        active:scale-95
      `;
    }
    return `
      hover:bg-brand-secondary-100
      transition-transform
      duration-300
      hover:scale-105
      active:scale-95
    `;
  };

  /* -----------------------------------------
     4.5. Butona tıklayınca:
        - Henüz finalChoice yoksa => Shuffle
        - finalChoice varsa => Share modal
  ----------------------------------------- */
  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (finalChoice) {
      setIsShareModalOpen(true);
    } else {
      handleShuffleDailyInspiration(e);
    }
  };

  /* -----------------------------------------
     Örnek: kimlik doğrulama (isteğe bağlı)
  ----------------------------------------- */
  const handleAuthentication = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const res = await authenticate(session);
    if (!res) {
      toast.error("Failed to authenticate wallet!");
      return;
    }
    toast.success("Welcome back!", { duration: 5000 });
    dispatch(setSession(res.session));
    // Yönlendirme
    window.location.href = "/app/dashboard/created";
  };

  return (
    <section className={styles.hero_section}>
      {/* Arka plan */}
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

      <div className={styles.hero_container}>
        <div className={styles.hero_content_container}>
          <h5 className={styles.hero_summary}>Create or join—either way, you win! 😎</h5>

          <div className="relative min-h-[180px] flex items-center justify-center text-center overflow-hidden whitespace-normal leading-normal px-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={titleKey}
                className={`${styles.hero_title} ${
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

          <h3 className={styles.hero_desc}>
            Empower your quizzes with rewards, boost engagement, transform learning or whatever you
            want.
          </h3>

          {hasTopButton && (
            <div className="flex flex-col gap-4 mt-4 md:flex-row">
              <Button
                variant="secondary"
                size="lg"
                className={getButtonClass()}
                onClick={handleButtonClick}
                disabled={isShuffling}
              >
                {getButtonText()}
                {finalChoice && <ShareIcon className="inline-block w-5 h-5 ml-2" />}
              </Button>

              <Button
                variant="tertiary"
                size="lg"
                className="hover:bg-brand-tertiary-500 transition-transform duration-300 hover:scale-105 active:scale-95"
                icon={false}
                onClick={handleAuthentication}
                disabled={false}
              >
                Create your first quiz
                <ArrowUpRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
