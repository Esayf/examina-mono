import { authenticate } from "@/hooks/auth";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSession } from "@/features/client/session";

import { useEffect, useState, MouseEvent } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import styles from "../../styles/Landing.module.css";
import BG from "@/images/backgrounds/hero-section-bg.svg";

interface HeroSectionProps {
  hasTopButton?: boolean;
  hasBackgroundPattern?: boolean;
}

// Her biri tam 39 karakter
const heroTitles = [
  "'Choz' to turn every decision into an advantage",
  "'Choz' to learn something new every day",
  "'Choz' to embrace positivity each moment",
  "'Choz' to discover reason to smile daily",
  "'Choz' to transform obstacles into steps",
  "'Choz' to be grateful for life blessings",
  "'Choz' to inspire love in each encounter",
  "'Choz' to welcome change, grow and shine",
  "'Choz' to brighten each moment in life",
  "'Choz' to follow your heart's true call",
  "'Choz' to see hope in each new sunrise",
  "'Choz' to stand through storms bravely",
  "'Choz' to greet each day with gratitude",
  "'Choz' to stay kind as storms test you",
  "'Choz' to trust in your boundless might",
  "'Choz' to keep curiosity alive in your journey",
  "'Choz' to celebrate small wins with big cheers",
  "'Choz' to inspire others through your kindness",
  "'Choz' to find beauty in unexpected moments",
  "'Choz' to be the light someone needs today",
  "'Choz' to seek growth in every test",
  "'Choz' to honor your dreams with action",
  "'Choz' to make gratitude your daily ritual",
  "'Choz' to radiate optimism wherever you go",
  "'Choz' to remain true to your authentic self",
];

export function HeroSection({
  hasTopButton = true,
  hasBackgroundPattern = true,
}: HeroSectionProps) {
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const [randomHeroTitle, setRandomHeroTitle] = useState("");
  const [titleKey, setTitleKey] = useState(0); // AnimatePresence için key

  useEffect(() => {
    shuffleTitle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rastgele metin seçip animasyonu tetikliyoruz
  const shuffleTitle = () => {
    const randomIndex = Math.floor(Math.random() * heroTitles.length);
    setRandomHeroTitle(heroTitles[randomIndex]);
    setTitleKey((prev) => prev + 1);
  };

  // Container'a tıklanınca başlığı değiştir
  const handleSectionClick = (e: MouseEvent<HTMLDivElement>) => {
    shuffleTitle();
  };

  // "Start creating" butonuna tıklandığında kimlik doğrulama
  const handleAuthentication = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // tıklamanın container'a yayılmasını engelle
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

  // Framer Motion animasyon ayarları
  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <section className={styles.hero_section}>
      {hasBackgroundPattern && (
        <div className={styles.hero_bg}>
          <Image src={BG} alt="Hero Background" fill className="w-full h-full object-cover" />
        </div>
      )}

      {/* Tüm container'a onClick ekliyoruz */}
      <div className={styles.hero_container} onClick={handleSectionClick}>
        <div className={styles.hero_content_container}>
          <h5 className={styles.hero_summary}>Create or join—either way, you win! 💜</h5>

          {/* min-h vererek yükseklik sabitleyebilir, flex ile ortalayabilirsiniz */}
          <div className="relative min-h-[60px] flex items-center justify-center text-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={titleKey}
                className={styles.hero_title}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                {randomHeroTitle}
              </motion.h1>
            </AnimatePresence>
          </div>

          <h3 className={styles.hero_desc}>
            Empower your quizzes with rewards, boost engagement, and transform learning. Fully
            secure, fully anonymous.
          </h3>

          {hasTopButton && (
            <button
              className="group relative inline-block h-[60px] w-[200px] overflow-hidden rounded-full text-lg text-black mt-3"
              onClick={handleAuthentication}
            >
              <div className="h-[inherit] w-[inherit] overflow-hidden rounded-full bg-brand-primary-400 [transition:_transform_1.5s_cubic-bezier(.19,1,.22,1)] group-hover:scale-[.94]">
                <span className="absolute bottom-0 left-1/2 z-20 block h-[200%] w-[120%] -translate-x-0 translate-y-[100%] bg-brand-tertiary-200 [border-radius:999px_999px_0_0] [translate:-50%] group-hover:translate-y-[10px] group-hover:[border-radius:60%_60%_0_0] group-hover:[transition:_transform_1s_cubic-bezier(.19,1,.22,1)_200ms,_border-radius_.2s_cubic-bezier(.19,1,.22,1)_270ms]" />
                <span className="absolute bottom-0 left-1/2 z-20 block h-[200%] w-[120%] -translate-x-0 translate-y-[100%] bg-brand-secondary-300 [border-radius:999px_999px_0_0] [translate:-50%] group-hover:translate-y-[10px] group-hover:[border-radius:60%_60%_0_0] group-hover:[transition:_transform_1s_cubic-bezier(.19,1,.22,1)_300ms,_border-radius_.2s_cubic-bezier(.19,1,.22,1)_470ms]" />
                <span className="absolute bottom-0 left-1/2 z-20 block h-[200%] w-[120%] -translate-x-0 translate-y-[100%] bg-brand-primary-400 [border-radius:999px_999px_0_0] [translate:-50%] group-hover:translate-y-[10px] group-hover:[border-radius:60%_60%_0_0] group-hover:[transition:_transform_1s_cubic-bezier(.19,1,.22,1)_380ms,_border-radius_.2s_cubic-bezier(.19,1,.22,1)_670ms]" />
              </div>
              <span className="absolute inset-0 z-10 m-auto flex w-4/5 items-center justify-center font-semibold group-hover:-translate-y-1/3 group-hover:opacity-0 group-hover:[transition:_transform_1s_cubic-bezier(.32,.99,.49,.99),_opacity_.4s]">
                Start creating
              </span>
              <span className="absolute inset-0 z-10 m-auto flex w-4/5 translate-y-1/3 items-center justify-center font-semibold opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:[transition:_1s_all_cubic-bezier(.32,.99,.49,.99)]">
                Start creating
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
