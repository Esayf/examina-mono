import styles from "../../styles/Landing.module.css";
import BG from "@/images/backgrounds/hero-section-bg.svg";
import Image from "next/image";

interface HeroSectionProps {
  hasTopButton?: boolean;
  hasBackgroundPattern?: boolean;
}

export function HeroSection({ hasTopButton = true, hasBackgroundPattern = true }: HeroSectionProps) {
  return (
    <section className={styles.hero_section}>
      {hasBackgroundPattern && (
        <div className={styles.hero_bg}>
          <Image src={BG} alt="Hero Background" fill className="w-full h-full object-cover" />
        </div>
      )}
      <div className={styles.hero_container}>
        <div className={styles.hero_content_container}>
          <h5 className={styles.hero_summary}>
            ✨ Choz AI features are almost here - Stay Tuned!
          </h5>
          <h1 className={styles.hero_title}>
            <span className={styles.highlight_word}>'Choz'</span> to turn every
            decision into an advantage
          </h1>
          <h3 className={styles.hero_desc}>
            Empower your quizzes with rewards, boost engagement, and transform
            learning. Fully secure, fully anonymous.
          </h3>
          {hasTopButton && (
            <button className="group relative inline-block h-[60px] w-[200px] overflow-hidden rounded-full text-lg text-black">
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
