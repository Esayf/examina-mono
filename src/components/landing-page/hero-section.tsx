"use client";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";

import { useEffect, useState, MouseEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import styles from "../../styles/Landing.module.css"; // <-- CSS Module yolunuzu düzenleyin
import BGR from "@/images/backgrounds/bg-5.svg"; // <-- Arka plan görseli
import { Button } from "@/components/ui/button"; // <-- Projenizdeki Button bileşeni
import { DocumentDuplicateIcon, XMarkIcon } from "@heroicons/react/24/outline";

// React Icons (Discord, Twitter vb.)
import { FaDiscord, FaTwitter, FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

// Kopyalanabilir link + QR Code
import { CopyLink } from "@/components/ui/copylink"; // CopyLink bileşeni
import { QRCodeCanvas } from "qrcode.react";

/* ------------------------------------------------------
   1) Hero Titles Dizisi
   ------------------------------------------------------ */
const heroTitles = [
  "#Choz to turn every decision into an advantage",
  "#Choz to learn something new every day",
  "#Choz to embrace positivity each moment",
  "#Choz to discover reason to smile daily",
  "#Choz to transform obstacles into steps",
  "#Choz to be unstoppable when dreams call you", // YENİ
  "#Choz to be grateful for life blessings",
  "#Choz to inspire love in each encounter",
  "#Choz to welcome change, grow and shine",
  "#Choz to brighten each moment in life",
  "#Choz to follow your heart's true call",
  "#Choz to see hope in each new sunrise",
  "#Choz to stand through storms bravely",
  "#Choz to greet each day with gratitude",
  "#Choz to earn deeper insight from daily tests", // YENİ
  "#Choz to stay kind as storms test you",
  "#Choz to defend fairness with pure heart",
  "#Choz to uphold justice each new day",
  "#Choz to cherish equality in all souls",
  "#Choz to value virtue as life's guide",
  "#Choz to nourish harmony for true peace",
  "#Choz to find unity in life's small gifts",
  "#Choz to walk gently on life's moral path",
  "#Choz to see each life just as precious",
  "#Choz to shape kindness into a habit",
  "#Choz to trust in your boundless might",
  "#Choz to keep curiosity alive in your journey",
  "#Choz to celebrate small wins with big cheers",
  "#Choz to inspire others through your kindness",
  "#Choz to find beauty in unexpected moments",
  "#Choz to be the light someone needs today",
  "#Choz to earn calm by embracing stillness", // YENİ
  "#Choz to seek growth in every test",
  "#Choz to honor your dreams with action",
  "#Choz to make gratitude your daily ritual",
  "#Choz to radiate optimism wherever you go",
  "#Choz to remain true to your authentic self",
  "#Choz to cherish honesty above all else",
  "#Choz to embrace reason as a guiding light",
  "#Choz to champion truth even when it's hard",
  "#Choz to cultivate empathy in every interaction",
  "#Choz to honor integrity in daily choices",
  "#Choz to build solidarity through compassion",
  "#Choz to forgive freely and heal your heart",
  "#Choz to remain humble while success grows",
  "#Choz to respect diversity as nature's design",
  "#Choz to stand for dignity without compromise",
  "#Choz to persist with hope when fear arises",
  "#Choz to be the voice for those left unheard",
  "#Choz to find clarity in mindful reflection",
  "#Choz to let kindness pave the path forward",
  "#Choz to trust resilience over self-doubt",
  "#Choz to let curiosity fuel your inner spark",
  "#Choz to practice tolerance in tough times",
  "#Choz to grow wisdom through shared stories",
  "#Choz to accept each fault with gentle grace",
  "#Choz to be true to self amid all opinions",
  "#Choz to experience each moment mindfully",
  "#Choz to embrace all differences with respect",
  "#Choz to listen to the silence within",
  "#Choz to approach everyone with empathy",
  "#Choz to care for nature as our shared home",
  "#Choz to find strength in learning from failures",
  "#Choz to enjoy the process of dedicated work",
  "#Choz to see the world through another's eyes",
  "#Choz to multiply joy by sharing positivity",
  "#Choz to patiently hear your inner guidance",
  "#Choz to be fearless in forging new paths", // YENİ
  "#Choz to let tiny steps grow your grand dreams",
  "#Choz to free yourself by lowering expectations",
  "#Choz to turn your passion into purposeful action",
  "#Choz to inspire others through self-compassion",
  "#Choz to foster solidarity in every challenge",
  "#Choz to earn trust by uplifting those around you", // YENİ
  "#Choz to cherish time's gift with steady patience",
  "#Choz to clear the path for others to move forward",
  "#Choz to see blessings in small details", // 1
  "#Choz to keep faith as new doors open", // 2
  "#Choz to preserve wonder in daily living", // 3
  "#Choz to greet changes with readiness", // 4
  "#Choz to let laughter mend broken hearts", // 5
  "#Choz to find hope even in still corners", // 6
  "#Choz to cultivate patience with grace", // 7
  "#Choz to learn forgiveness for inner peace", // 8
  "#Choz to celebrate triumph in each moment", // 9
  "#Choz to embrace calm amid the chaos", // 10
  "#Choz to see wonder in life's subtle art", // 11
  "#Choz to nurture clarity in each thought", // 12
  "#Choz to keep serenity close to your heart", // 13
  "#Choz to reflect deeply on each lesson", // 14
  "#Choz to spark kindness in weary minds", // 15
  "#Choz to honor life's precious mysteries", // 16
  "#Choz to see new dawns in silent nights", // 17
  "#Choz to weave compassion into each step", // 18
  "#Choz to be patient with your own pace", // 19
  "#Choz to shield truth from fleeting fear", // 20
  "#Choz to keep tenderness within your voice", // 21
  "#Choz to find synergy in shared visions", // 22
  "#Choz to guard humility in great success", // 23
  "#Choz to be calm as new storms awaken", // 24
  "#Choz to see growth in every misstep", // 25
  "#Choz to admire resilience in yourself", // 26
  "#Choz to chase dreams through open skies", // 27
  "#Choz to forge joy from fleeting sorrow", // 28
  "#Choz to be mindful of gentle whispers", // 29
  "#Choz to sense love in subtle moments", // 30
  "#Choz to be content with your progress", // 31
  "#Choz to stand firmly in quiet truths", // 32
  "#Choz to shape empathy into daily acts", // 33
  "#Choz to invite harmony into every bond", // 34
  "#Choz to keep faith in storms darkest", // 35
  "#Choz to be present in each heartbeat", // 36
  "#Choz to uphold sincerity in choices", // 37
  "#Choz to sense wonder in dull places", // 38
  "#Choz to heal wounds with kind presence", // 39
  "#Choz to cradle hope in silent prayers", // 40
  "#Choz to find passion in hidden corners", // 41
  "#Choz to greet life with open acceptance", // 42
  "#Choz to harness empathy as your power", // 43
  "#Choz to let grace soothe restless minds", // 44
  "#Choz to trust healing in earnest tears", // 45
  "#Choz to let peace color your perspective", // 46
  "#Choz to cradle delight in daily wonders", // 47
  "#Choz to embrace wisdom in small gestures", // 48
  "#Choz to keep shining in silent trials", // 49
  "#Choz to protect honesty from all doubt", // 50
  "#Choz to let solitude spark reflection", // 51
  "#Choz to sow positivity with each breath", // 52
  "#Choz to guard your joy from negativity", // 53
  "#Choz to keep warmth in darkest hours", // 54
  "#Choz to glean strength from wise mentors", // 55
  "#Choz to feel blessings in each sunrise", // 56
  "#Choz to be open-hearted amid the noise", // 57
  "#Choz to let trust guide uncertain paths", // 58
  "#Choz to taste freedom in letting go", // 59
  "#Choz to embrace calm in daily routines", // 60
  "#Choz to refine courage with every trial", // 61
  "#Choz to sense unity in diverse voices", // 62
  "#Choz to breathe hope into silent hearts", // 63
  "#Choz to glean insight from quiet grace", // 64
  "#Choz to elevate hearts with gentle truths", // 65
  "#Choz to let synergy move shared visions", // 66
  "#Choz to yield wisdom from each vantage", // 67
  "#Choz to renew purpose at each crossroad", // 68
  "#Choz to be steady as horizons shift", // 69
  "#Choz to keep empathy as your foundation", // 70
  "#Choz to see eternity in each moment", // 71
];

/* ------------------------------------------------------
   2) getShareMessage: Paylaşım metni
   ------------------------------------------------------ */
function getShareMessage(quote: string) {
  return `🚀 Check out my #Choz Inspiration! 🚀

"${quote}"

Join me in using #Choz to find a daily dose of positivity & motivation!
`;
}

/* ------------------------------------------------------
   3) ShareModal Bileşeni
   ------------------------------------------------------ */
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
  // 3.1 Discord => Sadece metni kopyalar
  const handleShareDiscord = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Copied! Now open Discord and paste it.");
    } catch {
      toast.error("Failed to copy!");
    }
  };

  // 3.2 Twitter
  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  // 3.3 WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // 3.4 Telegram
  const handleShareTelegram = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://t.me/share/url?url=&text=${text}`, "_blank");
  };

  // 3.5 Copy to Clipboard (genel)
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy!");
    }
  };

  // -- Quiz Link (Kullanıcı belki direkt linki kopyalamak isteyebilir) --
  // (Bazı senaryolarda bir link olacaksa, ekleyebilirsiniz. Burada tek cümle var ama yine de gösteriyoruz.)
  const quizLink = "https://#ChozInspiration"; // Örneğin "https://example.com/inspiration"

  // QR Kodu indirme
  const downloadQRCode = () => {
    const canvas = document.getElementById("quizQrCode") as HTMLCanvasElement | null;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "quiz-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white w-[90%] max-w-md rounded-3xl p-6 border-1 border-greyscale-light-200 relative"
      >
        {/* Kapatma butonu */}
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

        {/* İkon tabanlı paylaşım seçenekleri */}
        <div className="flex justify-center items-center flex-wrap gap-5 mb-6">
          {/* Discord */}
          <button
            onClick={handleShareDiscord}
            className="
              flex flex-col items-center
              text-gray-700 hover:text-black
              focus:outline-none
              transition-transform duration-150
              hover:scale-105 active:scale-95
            "
          >
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaDiscord className="text-xl" />
            </div>
            <span className="text-xs font-medium">Discord</span>
          </button>

          {/* Twitter */}
          <button
            onClick={handleShareTwitter}
            className="
              flex flex-col items-center
              text-gray-700 hover:text-black
              focus:outline-none
              transition-transform duration-150
              hover:scale-105 active:scale-95
            "
          >
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaTwitter className="text-xl" />
            </div>
            <span className="text-xs font-medium">Twitter</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="
              flex flex-col items-center
              text-gray-700 hover:text-black
              focus:outline-none
              transition-transform duration-150
              hover:scale-105 active:scale-95
            "
          >
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaWhatsapp className="text-xl" />
            </div>
            <span className="text-xs font-medium">WhatsApp</span>
          </button>

          {/* Telegram */}
          <button
            onClick={handleShareTelegram}
            className="
              flex flex-col items-center
              text-gray-700 hover:text-black
              focus:outline-none
              transition-transform duration-150
              hover:scale-105 active:scale-95
            "
          >
            <div className="w-16 h-16 flex items-center justify-center bg-greyscale-light-100 rounded-full mb-1">
              <FaTelegramPlane className="text-xl" />
            </div>
            <span className="text-xs font-medium">Telegram</span>
          </button>
        </div>

        {/* “Copy Message” büyük buton */}
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

/* ------------------------------------------------------
   4) HeroSection Bileşeni - Günde 1 Kere Shuffle
   ------------------------------------------------------ */
interface HeroSectionProps {
  hasTopButton?: boolean;
  hasBackgroundPattern?: boolean;
}

export function HeroSection({
  hasTopButton = true,
  hasBackgroundPattern = true,
}: HeroSectionProps) {
  // Redux vb. session
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const [randomHeroTitle, setRandomHeroTitle] = useState("");
  const [titleKey, setTitleKey] = useState(0);

  // Shuffle kontrol değişkenleri
  const [canShuffle, setCanShuffle] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [finalChoice, setFinalChoice] = useState(false);

  // Modal durumu
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Framer Motion animasyon varyantları
  const finalVariants = {
    initial: { opacity: 0, y: 10, scale: 1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 1 },
    final: {
      opacity: 1,
      y: 0,
      scale: [1, 1.15, 1],
      transition: { duration: 0.4 },
    },
  };

  /* ------------------------------------------
     4.1. localStorage => günlük shuffle
  ------------------------------------------ */
  useEffect(() => {
    const storedTitle = localStorage.getItem("dailyInspiration");
    const storedDay = localStorage.getItem("dailyShuffleDay");
    const todayDay = new Date().toDateString();

    // Eğer bugün shuffle yapıldıysa:
    if (storedDay === todayDay && storedTitle) {
      setRandomHeroTitle(storedTitle);
      // Artık shuffle yapılamasın:
      setCanShuffle(false);
      setFinalChoice(true); // shuffle sonucu
    } else {
      // Yeni gün (veya hiç yok)
      localStorage.setItem("dailyShuffleDay", todayDay);
      // Varsayılan
      setRandomHeroTitle("#Choz to turn quizzes into rewarding experiences");
      setCanShuffle(true);
      setFinalChoice(false);
    }
  }, []);

  /* ------------------------------------------
     Rastgele cümle seç
  ------------------------------------------ */
  const shuffleTitle = () => {
    const randomIndex = Math.floor(Math.random() * heroTitles.length);
    setRandomHeroTitle(heroTitles[randomIndex]);
    setTitleKey((prev) => prev + 1);
  };

  /* ------------------------------------------
     4.2. Tek seferlik Shuffle (2sn animasyon)
  ------------------------------------------ */
  const handleShuffleDailyInspiration = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!canShuffle || isShuffling) {
      toast.error("Come back tomorrow.");
      return;
    }
    setFinalChoice(false);
    setIsShuffling(true);

    // Shuffle animasyonu
    const intervalId = setInterval(() => {
      shuffleTitle();
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
      shuffleTitle();
      setIsShuffling(false);
      setCanShuffle(false);
      setFinalChoice(true);

      // final cümleyi localStorage'a kaydet
      localStorage.setItem("dailyInspiration", randomHeroTitle);
      localStorage.setItem("dailyShuffleDay", new Date().toDateString());
    }, 2000);
  };

  /* ------------------------------------------
     4.3. Buton metni / stili
  ------------------------------------------ */
  const getButtonText = () => {
    if (isShuffling) return "Shuffling...";
    if (finalChoice) return "Share your daily #Choz";
    return "Shuffle";
  };

  const getButtonClass = () => {
    if (finalChoice) {
      return `
        bg-brand-secondary-200
        hover:bg-brand-secondary-300
        text-brand-primary-900
        transition-transform
        duration-300
        hover:scale-105
        active:scale-95
      `;
    }
    return `
      hover:bg-brand-primary-800
      transition-transform
      duration-300
      hover:scale-105
      active:scale-95
    `;
  };

  /* ------------------------------------------
     4.4. Butona tıklama => ya shuffle, ya share
  ------------------------------------------ */
  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (finalChoice) {
      setIsShareModalOpen(true);
    } else {
      handleShuffleDailyInspiration(e);
    }
  };

  // Kimlik doğrulama (opsiyonel)
  const handleAuthentication = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
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

  /* ------------------------------------------
     Return => Hero Section + Modal
  ------------------------------------------ */
  return (
    <section className={styles.hero_section}>
      {hasBackgroundPattern && (
        <div className={styles.hero_bg}>
          <Image src={BGR} alt="Hero Background" fill className="w-full h-full object-cover" />
        </div>
      )}

      {/* SHARE MODAL */}
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

          {/* Dinamik hero başlık */}
          <div className="relative min-h-[180px] flex items-center justify-center text-center overflow-hidden whitespace-normal leading-normal px-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={titleKey}
                className={styles.hero_title}
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
                size="lg"
                icon={false}
                className={getButtonClass()}
                onClick={handleButtonClick}
                disabled={isShuffling}
              >
                {getButtonText()}
                {finalChoice && <DocumentDuplicateIcon className="inline-block w-5 h-5 ml-2" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
