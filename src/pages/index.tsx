"use client";
import styles from "../styles/Landing.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import Head from "next/head";

// Components
import { Header } from "@/components/landing-page/header";
import { HeroSection } from "@/components/landing-page/hero-section";
import { HowItWorksSection } from "@/components/landing-page/section-2";
import { TextMessageSection } from "@/components/landing-page/text-message-section";
import TechSection from "@/components/landing-page/section-4";
import SubCtaSection from "@/components/landing-page/sub-cta-section";

// Images
import Choz from "@/images/landing-header/logo-type.svg";
import Mina from "@/images/landing_general/mina.svg";
import OGImage from "@/images/backgrounds/ogimage.png";
import AppleTouchIcon from "public/apple-touch-icon.png";
import Favicon from "public/favicon.ico";

// State Management
import { authenticate } from "@/hooks/auth";
import { setSession } from "@/features/client/session";
import { useAppDispatch, useAppSelector, useAppStore } from "@/app/hooks";
import SocialLinks from "@/components/landing-page/social-links";
import TeamSection from "@/components/landing-page/team-section";

const featureArr = [
  {
    featureTitle: "Secure 🔒",
    featureDesc: "Blockchain security powered by Mina Protocol.",
  },
  {
    featureTitle: "Fast 🚀",
    featureDesc: "No email or password—just Auro Wallet. Start instantly.",
  },
  {
    featureTitle: "Free 🤑",
    featureDesc: "Create and join exams for free in under a minute.",
  },
  {
    featureTitle: "Private 🔒",
    featureDesc: "No personal data or scores stored. Your privacy is safe.",
  },
  {
    featureTitle: "Decentralized 🌐",
    featureDesc: "Global connectivity secured by blockchain.",
  },
  {
    featureTitle: "Smart 🧠",
    featureDesc: "Choz Smart Contract integrates external exams seamlessly.",
  },
];

const techArr = [
  {
    techTitle: "Zero Knowledge",
    techDesc:
      "With Zero Knowledge, Choz creates quizzes without revealing questions, answers, responses, or identities, ensuring complete confidentiality.",
    techLink:
      "https://choz.medium.com/unveiling-examinas-zero-knowledge-magic-a-journey-into-trust-and-anonymity-cd56c7330998",
  },
  {
    techTitle: "Mina zkProgram",
    techDesc:
      "Our score verifier uses a Recursive Proof Of Score zkProgram. That enables us to prove quiz results without revealing your score and answers.",
    techLink:
      "https://choz.medium.com/navigating-the-world-of-zk-programs-examinas-insight-into-secure-exam-scoring-ea974e0b11ed",
  },
  {
    techTitle: "Web3 Session System",
    techDesc:
      "We generate a session based on your signature. Which enables us to verify your wallet ownership. Without any gas fees or private information!",
    techLink:
      "https://medium.com/@choz/web3-sessions-bridging-the-gap-between-security-and-seamless-backend-integration-3eaf3ff8f995",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Choz",
  description:
    "Next-generation blockchain-powered quiz platform with reward distribution and zero-knowledge proofs",
  applicationCategory: "Education, Assessment",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Secure blockchain-based quizzes",
    "Zero-knowledge proof verification",
    "Reward distribution system",
    "Private and decentralized",
    "Web3 integration",
  ],
};

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const session = useAppSelector((state) => state.session);

  const handleAuthentication = async () => {
    const res = await authenticate(session);
    if (!res) {
      toast.error("Failed to authenticate wallet!");
      return;
    }
    toast.success("Welcome back!");
    dispatch(setSession(res.session));
    window.location.href = "/app/dashboard/created";
  };

  const pageTitle = "Choz | Blockchain-Powered Quiz Platform for Rewards and Engagement";
  const pageDescription =
    "Revolutionize assessments with Choz: the blockchain-powered quiz platform using zero-knowledge proofs for secure, private, and rewarding experiences. Create, share, and engage with decentralized quizzes powered by Mina Protocol.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="blockchain quiz, zero knowledge proof, reward distribution, decentralized assessment, Mina Protocol, Web3 quiz platform, secure testing, blockchain quiz platform, zero-knowledge proof quizzes, decentralized quiz platform, secure quizzes blockchain, quiz rewards system, Web3 quiz platform, private quiz platform, Mina Protocol quizzes, blockchain-powered assessment, zero-knowledge exam system, decentralized learning tools, secure online quizzes, gamified blockchain quizzes, anonymous quiz platform, Web3 education tools, zkProof quiz platform, online quiz rewards, privacy-first quiz system, next-generation quiz platform, Choz blockchain quiz, gamification education platform, interactive learning tools, competitive quiz platform, blockchain rewards education, secure exam hosting, Web3 gamified education, decentralized competitive quizzes, exam privacy protection, smart contract education, blockchain-powered teaching tools"
        />

        {/* Temel SEO Meta Tagleri */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choz" />
        <meta name="copyright" content="Choz" />
        <meta name="application-name" content="Choz" />

        {/* Open Graph / Facebook */}
        <meta property="og:site_name" content="Choz" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://choz.io" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OGImage.src} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Choz Platform Overview" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter/X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@chozapp" />
        <meta name="twitter:creator" content="@chozapp" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={OGImage.src} />
        <meta name="twitter:image:alt" content="Choz Platform Overview" />

        {/* PWA ve Mobil Optimizasyon */}
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Choz" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href={Favicon.src} type="image/x-icon" />
        <link rel="apple-touch-icon" href={AppleTouchIcon.src} />

        {/* Canonical ve Dil Etiketleri */}
        <link rel="canonical" href="https://choz.io" />
        <link rel="alternate" href="https://choz.io" hrefLang="x-default" />
        <link rel="alternate" href="https://choz.io" hrefLang="en" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>

      <main className="min-h-screen overflow-hidden">
        <div className={styles.container}>
          <div className={styles.background_pattern}>
            {/* Header */}
            <Header size="xl" state="not-connected" />
            {/* Hero Section */}
            <HeroSection />
          </div>
        </div>
        {/* How It Works Section */}
        <HowItWorksSection />
        {/* Text Message Section */}
        <TextMessageSection />
        {/* Team Section */}
        <TeamSection />
        {/* Technologies Section */}
        <TechSection
          techArr={techArr.map((tech) => ({ ...tech, techExplanation: tech.techDesc }))}
        />
        {/* Sub CTA Section */}
        <SubCtaSection handleAuthentication={handleAuthentication} />
        {/* Supporters Section */}
        <section className={`${styles.supporters_container}`} aria-label="Supporters">
          <h2>proudly built on.</h2>
          <Link
            href="https://minaprotocol.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="supporter-link"
            aria-label="Visit Mina Protocol - Our Blockchain Technology Partner"
          >
            <span className="sr-only">Learn more about our partnership with Mina Protocol</span>
            <Image
              src={Mina}
              alt="Mina Protocol - Blockchain Technology Partner"
              className="w-full h-full object-cover items-center"
              priority={true}
            />
          </Link>
        </section>

        {/* Footer */}
        <footer className={styles.footer_container} role="contentinfo">
          <div className={styles.footer_logo_container}>
            <Link href="/" aria-label="Return to Choz Homepage">
              <Image src={Choz} alt="Choz - Next Generation Quiz Platform" priority={true} />
            </Link>
          </div>

          {/* Social Links */}
          <SocialLinks />
          <p className={styles.copyright + " whitespace-nowrap"}>
            © {new Date().getFullYear()} Choz - All rights reserved
          </p>
        </footer>
      </main>
    </>
  );
}
