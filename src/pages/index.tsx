"use client";
import styles from "../styles/Landing.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import Head from "next/head";

// Components
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Header } from "@/components/landing-page/header";
import { HeroSection } from "@/components/landing-page/hero-section";

// Images
import Choz from "@/images/landing-header/logo-type.svg";
import BG from "@/images/backgrounds/hero-section-bg.svg";
import CTA from "@/images/backgrounds/text-cta-section-bg.svg";
import SUBCTA from "@/images/backgrounds/sub-cta-bg.svg";
import Mina from "@/images/landing_general/mina.svg";

// State Management
import { authenticate } from "@/hooks/auth";
import { setSession } from "@/features/client/session";
import { useAppDispatch, useAppSelector, useAppStore } from "@/app/hooks";

// Data Arrays
const stepArr = [
  {
    stepText: "STEP 1",
    stepTitle: "Seamlessly start 🥳",
    stepDesc:
      "Jump right in – no signup needed! Just connect and go! Simply press the 'Connect’ button to seamlessly link your Pallad or Auro Wallet.",
  },
  {
    stepText: "STEP 2",
    stepTitle: "Add your questions 💪",
    stepDesc: "Design your quiz in minutes – choose questions, add rewards, and you’re set!",
  },
  {
    stepText: "STEP 3",
    stepTitle: "Quickly share 🚀",
    stepDesc: "With a single click, your quiz is live and ready to engage your audience!",
  },
];

const featureArr = [
  {
    featureTitle: "Secure 🔒",
    featureDesc:
      "Experience the pinnacle of security with our cutting-edge exam system fortified by next-generation blockchain technology powered by Mina Protocol",
  },
  {
    featureTitle: "Fast 🚀",
    featureDesc:
      "Effortless registration and exam entry: No email or password needed – just use your Auro Wallet and start your journey seamlessly!",
  },
  {
    featureTitle: "Free 🤑",
    featureDesc:
      "Enjoy the freedom – register and create your exam in just a minute, absolutely free!",

  },
  {
    featureTitle: "Private 🔒",
    featureDesc:
      "Your privacy is paramount to us! Rest assured, we do not retain any private information about you, encompassing your test scores and identity.",
  },
  {
    featureTitle: "Decentralized 🌐",
    featureDesc:
      "Blockchain empowers secure global connectivity, enabling seamless connections to anywhere in the world.",
  },
  {
    featureTitle: "Smart 🧠",
    featureDesc:
      "Utilize the intelligence of our Choz Smart Contract, seamlessly integrating external exams for a more efficient and technologically advanced system.",
  },
];

const techArr = [
  {
    techTitle: "Zero Knowledge",
    techDesc:
      "With Zero Knowledge, Choz enables quiz creation without revealing questions, answers, user responses, or personal identity, ensuring complete confidentiality.",
    techLink:
      "https://choz.medium.com/unveiling-examinas-zero-knowledge-magic-a-journey-into-trust-and-anonymity-cd56c7330998",
  },
  {
    techTitle: "Mina zkProgram",
    techDesc:
      "Our score verifier uses a Recursive Proof Of Score zkProgram. That enables us to prove quiz results without revealing your score and answers",
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
  "name": "Choz",
  "description": "Next-generation blockchain-powered quiz platform with reward distribution and zero-knowledge proofs",
  "applicationCategory": "Education, Assessment",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Secure blockchain-based quizzes",
    "Zero-knowledge proof verification",
    "Reward distribution system",
    "Private and decentralized",
    "Web3 integration"
  ]
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
    window.location.href = "/app";
  };

  const pageTitle = "Choz | Blockchain-Powered Quiz Platform for Rewards and Engagement";
  const pageDescription = "Revolutionize assessments with Choz: the blockchain-powered quiz platform using zero-knowledge proofs for secure, private, and rewarding experiences. Create, share, and engage with decentralized quizzes powered by Mina Protocol."

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="blockchain quiz, zero knowledge proof, reward distribution, decentralized assessment, Mina Protocol, Web3 quiz platform, secure testing, blockchain quiz platform, zero-knowledge proof quizzes, decentralized quiz platform, secure quizzes blockchain, quiz rewards system, Web3 quiz platform, private quiz platform, Mina Protocol quizzes, blockchain-powered assessment, zero-knowledge exam system, decentralized learning tools, secure online quizzes, gamified blockchain quizzes, anonymous quiz platform, Web3 education tools, zkProof quiz platform, online quiz rewards, privacy-first quiz system, next-generation quiz platform, Choz blockchain quiz, gamification education platform, interactive learning tools, competitive quiz platform, blockchain rewards education, secure exam hosting, Web3 gamified education, decentralized competitive quizzes, exam privacy protection, smart contract education, blockchain-powered teaching tools" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://choz.io" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content="Choz" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@chozapp" />
        <meta name="twitter:creator" content="@chozapp" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Choz" />
        <meta name="application-name" content="Choz" />
        
        {/* PWA Tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Choz" />
        
        {/* Language and Locale */}
        <meta property="og:locale" content="en_US" />
        <link rel="canonical" href="https://choz.io" />
        <link rel="alternate" href="https://choz.io" hrefLang="x-default" />
        <link rel="alternate" href="https://choz.io" hrefLang="en" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>

      <main className="min-h-screen">
        <div className={styles.container}>
          <div className={styles.background_pattern}>
            {/* Header */}
            <Header size="xl" state="not-connected" />
            {/* Hero Section */}
            <HeroSection />
          </div>
        </div>

        {/* How it Works Section */}
        <section className={styles.section_container} aria-label="How it Works">
          <div className={styles.container}>
            <h2 className={styles.section_title}>HOW IT WORKS</h2>
            <h3 className={styles.section_summary}>
              Your quizzes, <span>simplified</span>.
            </h3>
            <p className={styles.section_desc}>
              Whether for training, customer engagement, or pure fun, Choz brings together everything you need for a seamless and impactful quiz experience.
            </p>
            <div className={styles.card_container} role="list">
              {stepArr.map((step, index) => (
                <div className={styles.usage_card} key={index} role="listitem">
                  <div className={styles.usage_card_title_container}>
                    <p className={styles.usage_card_title_step}>{step.stepText}</p>
                    <h4 className={styles.usage_card_title}>{step.stepTitle}</h4>
                  </div>
                  <p className={styles.usage_card_desc}>{step.stepDesc}</p>
                </div>
              ))}
            </div>
            <div className={styles.section_button_container}>
              <Link 
                href="/app/create-exam"
                className={styles.cta_button}
                aria-label="Start creating your first quiz on Choz"
              >
                <Button 
                  variant="default" 
                  pill={true} 
                  size="default" 
                  icon={true} 
                  iconPosition="right"
                >
                  Create now<ArrowUpRightIcon className="size-6" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>


        {/* Text Message Section */}
        <section className={`${styles.section_container} ${styles.section_container_secondary}`} aria-label="Value Proposition">
          <div className={styles.text_cta_container}>
            <div className={styles.section_background}>
              <Image src={CTA} alt="CTA Background" className="w-full h-full object-cover" />
            </div>
            <div className={styles.text_cta_content}>
              <h1 className={styles.text_cta_title}>
                Empower your audience
              </h1>
              <h3 className={styles.text_cta_desc}>
                At Choz, rewards do more than add value. They transform quizzes into exciting, competitive experiences. Motivate your team, engage customers, or make learning fun.
              </h3>
            </div>
          </div>
        </section>  

        {/* Features Section */}
        <section className={styles.section_container} aria-label="Features">
          <div className={styles.container}>
            <h2 className={styles.section_title}>OUR FEATURES</h2>
            <h3 className={styles.section_summary}>
              Meet <span>next generation</span> exam platform
            </h3>
            <p className={styles.section_desc}>
              We offer an experience you&apos;ve never used before with our unique
              features.
            </p>
            <div className={styles.card_container} role="list">
              {featureArr.map((feature, index) => (
                <div key={index} className={styles.feature_card_container} role="listitem">
                  <div className={styles.feature_card_text_container}>
                    <h4 className={styles.feature_card_title}>
                      {feature.featureTitle}
                    </h4>
                    <p className={styles.feature_card_desc}>{feature.featureDesc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies Section */}
        <section className={`${styles.section_container} ${styles.section_container_secondary}`} aria-label="Technologies">
          <div className={styles.container}>
            <h2 className={styles.section_title}>OUR TECHNOLOGIES</h2>
            <h3 className={styles.section_summary}>
              Choz <span>uses</span> these technologies
            </h3>
            <p className={styles.section_desc}>
              We provide a safe, fast and technological experience with the
              technologies we use.
            </p>
            <div className={styles.card_container} role="list">
              {techArr.map((tech, index) => (
                <div key={index} className={styles.tech_card_container} role="listitem">
                  <SparklesIcon className="size-8" aria-hidden="true" />
                  <div className={styles.tech_card_text_container}>
                    <h4 className={styles.tech_card_title}>{tech.techTitle}</h4>
                    <p className={styles.tech_card_desc}>{tech.techDesc}</p>
                  </div>
                  <div className={styles.tech_card_link_container}>
                    <Link
                      href={tech.techLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.techLink}
                      aria-label={`Read detailed article about ${tech.techTitle} technology in Choz`}
                    >
                      Learn more <ArrowUpRightIcon className="size-6" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sub CTA Section */}
        <section className={`${styles.section_container} ${styles.section_container_secondary}`} aria-label="Call to Action">
          <div className={styles.section_background}>
            <Image 
              src={SUBCTA} 
              alt="" 
              className="w-full h-full object-cover" 
              aria-hidden="true"
              priority={true}
            />
          </div>
          <div className={styles.sub_section_container}>      
            <div className={styles.container}>
              <div className={styles.sub_section_text_container}>
                <h2>It's rewarding, it's engaging, are you ready to dive in?</h2>
              </div>
            </div>
          </div>
        </section>

        {/* Supporters Section */}
        <section className={`${styles.supporters_container} ${styles.section_container_secondary}`} aria-label="Supporters">
          <h2>💜 Supported by Industry Leaders 💜</h2>
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
              className="w-full h-full object-cover"
              priority={true}
            />
          </Link>
        </section>

        {/* Footer */}
        <footer className={styles.footer_container} role="contentinfo">
          <div className={styles.logo_container}>
            <Link href="/" aria-label="Return to Choz Homepage">
              <Image 
                src={Choz} 
                alt="Choz - Next Generation Quiz Platform" 
                height={50} 
                width={100}
                priority={true}
              />
            </Link>
          </div>
          <nav className={styles.social_links}>
            <Link 
              href="https://x.com/chozapp" 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer_link}
              aria-label="Visit our X account"
              hidden={true}
            >
              X Account
            </Link>
            <Link 
              href="https://choz.medium.com" 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer_link}
              aria-label="Read our privacy policy and data protection measures"
              hidden={true}
            >
              Medium Blog
            </Link>
            <Link 
              href="https://www.linkedin.com/company/chozapp" 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer_link}
              aria-label="Visit our LinkedIn page"
              hidden={true}
            >
              LinkedIn
            </Link>
          </nav>
          <p className={styles.copyright + " whitespace-nowrap"}>© {new Date().getFullYear()} Choz - All rights reserved</p>
        </footer>
      </main>
    </>
  );
}
