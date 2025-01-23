import { authenticate } from "@/hooks/auth";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSession } from "@/features/client/session";

import { useEffect, useState, MouseEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import styles from "../../styles/Landing.module.css";
import BGR from "@/images/backgrounds/bg-5.svg";
import { Button } from "@/components/ui/button";
import { PaintBrushIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

interface HeroSectionProps {
  hasTopButton?: boolean;
  hasBackgroundPattern?: boolean;
}

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

export function HeroSection({
  hasTopButton = true,
  hasBackgroundPattern = true,
}: HeroSectionProps) {
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const [randomHeroTitle, setRandomHeroTitle] = useState("");
  const [titleKey, setTitleKey] = useState(0);

  // Günde 1 kez shuffle (localStorage)
  const [canShuffle, setCanShuffle] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [finalChoice, setFinalChoice] = useState(false);

  // Framer Motion animasyon
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

  useEffect(() => {
    // localStorage'dan kontrol et
    const storedTitle = localStorage.getItem("dailyInspiration");
    const storedDay = localStorage.getItem("dailyShuffleDay");
    const todayDay = new Date().toDateString();

    if (storedDay === todayDay && storedTitle) {
      setRandomHeroTitle(storedTitle);
      setCanShuffle(true);
      setFinalChoice(false);
    } else {
      // Yeni gün veya ilk kez
      localStorage.setItem("dailyShuffleDay", todayDay);
      setRandomHeroTitle("#Choz to turn quizzes into rewarding experiences");
      setCanShuffle(true);
      setFinalChoice(false);
    }
  }, []);

  // Rastgele cümle
  const shuffleTitle = () => {
    const randomIndex = Math.floor(Math.random() * heroTitles.length);
    setRandomHeroTitle(heroTitles[randomIndex]);
    setTitleKey((prev) => prev + 1);
  };

  // Kimlik doğrulama
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

  // Shuffle (3 sn)
  const handleShuffleDailyInspiration = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!canShuffle || isShuffling) {
      toast.error("Come back tomorrow.");
      return;
    }
    setFinalChoice(false);
    setIsShuffling(true);

    const intervalId = setInterval(() => {
      shuffleTitle();
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
      shuffleTitle();
      setIsShuffling(false);
      setCanShuffle(false);
      setFinalChoice(true);

      // final cümleyi localStorage'da sakla
      localStorage.setItem("dailyInspiration", randomHeroTitle);
    }, 3000);
  };

  // Kopyalama
  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(randomHeroTitle);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy!");
    }
  };

  // Buton metni
  const getButtonText = () => {
    if (isShuffling) return "Shuffling...";
    if (finalChoice) return "Copy here, see you tomorrow!";
    return "#Choz your daily inspiration 💜";
  };

  // Buton tıklama
  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (finalChoice) {
      handleCopyQuote();
    } else {
      handleShuffleDailyInspiration(e);
    }
  };

  // finalChoice true => yeşil
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

  const getTitleClass = () => {
    return `${styles.hero_title}`;
  };

  return (
    <section className={styles.hero_section}>
      {hasBackgroundPattern && (
        <div className={styles.hero_bg}>
          <Image src={BGR} alt="Hero Background" fill className="w-full h-full object-cover" />
        </div>
      )}

      <div className={styles.hero_container}>
        <div className={styles.hero_content_container}>
          {/* Kısa alt başlık */}
          <h5 className={styles.hero_summary}>Create or join—either way, you win! 😎</h5>

          {/* Dinamik hero başlık */}
          <div className="relative min-h-[180px] flex items-center justify-center text-center overflow-hidden whitespace-normal leading-normal px-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={titleKey}
                className={getTitleClass()}
                variants={finalVariants}
                initial="initial"
                animate={finalChoice ? "final" : "animate"}
                exit="exit"
              >
                {randomHeroTitle}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Alt açıklama */}
          <h3 className={styles.hero_desc}>
            Empower your quizzes with rewards, boost engagement, transform learning or whatever you
            want.
          </h3>

          {/* Butonlar */}
          {hasTopButton && (
            <div className="flex flex-col gap-4 mt-4 md:flex-row">
              {/* Shuffle or Copy butonu */}
              <Button
                size="lg"
                icon={false}
                className={getButtonClass()}
                onClick={handleButtonClick}
                disabled={isShuffling || (!canShuffle && !finalChoice)}
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
