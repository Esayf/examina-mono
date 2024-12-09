"use client";
import styles from "../styles/Landing.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";

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
    stepTitle: "Connect",
    stepDesc:
      "Seamlessly connect via the Auro Wallet by simply pressing the 'Connect Wallet' button.",
  },
  {
    stepText: "STEP 2",
    stepTitle: "Create",
    stepDesc: "Navigate to the exam creation page and fill in your questions and answers.",
  },
  {
    stepText: "STEP 3",
    stepTitle: "Publish",
    stepDesc: "Publish your exam and you are good to go!",
  },
];

const featureArr = [
  {
    featureTitle: "Secure",
    featureDesc:
      "Experience the pinnacle of security with our cutting-edge exam system fortified by next-generation blockchain technology powered by Mina Protocol",
  },
  {
    featureTitle: "Fast",
    featureDesc:
      "Effortless registration and exam entry: No email or password needed – just use your Auro Wallet and start your journey seamlessly!",
  },
  {
    featureTitle: "Free",
    featureDesc:
      "Enjoy the freedom – register and create your exam in just a minute, absolutely free!",

  },
  {
    featureTitle: "Private",
    featureDesc:
      "Your privacy is paramount to us! Rest assured, we do not retain any private information about you, encompassing your test scores and identity.",
  },
  {
    featureTitle: "Decentralized",
    featureDesc:
      "Blockchain empowers secure global connectivity, enabling seamless connections to anywhere in the world.",
  },
  {
    featureTitle: "Smart",
    featureDesc:
      "Utilize the intelligence of our Choz Smart Contract, seamlessly integrating external exams for a more efficient and technologically advanced system.",
  },
];

const techArr = [
  {
    techTitle: "Zero Knowledge",
    techDesc:
      "Leveraging Zero Knowledge, Choz empowers the creation of exams without disclosing questions, correct answers, user responses, or personal identity, ensuring utmost confidentiality.",
    techLink:
      "https://examina.medium.com/unveiling-examinas-zero-knowledge-magic-a-journey-into-trust-and-anonymity-cd56c7330998",
  },
  {
    techTitle: "Mina zkProgram",
    techDesc:
      "Our score verifier uses a Recursive Proof Of Score zkProgram. That enables us to prove exam results without revealing your score and answers",
    techLink:
      "https://examina.medium.com/navigating-the-world-of-zk-programs-examinas-insight-into-secure-exam-scoring-ea974e0b11ed",
  },
  {
    techTitle: "Web3 Session System",
    techDesc:
      "We generate a session based on your signature. Which enables us to verify your wallet ownership. Without any gas fees or private information!",
    techLink:
      "https://examina.medium.com/web3-sessions-bridging-the-gap-between-security-and-seamless-backend-integration-3eaf3ff8f995",
  },
];

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

  return (
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
        <section className={styles.section_container}>
          <div className={styles.container}>
          <h5 className={styles.section_title}>HOW IT WORKS</h5>
          <h1 className={styles.section_summary}>
            Your quizzes, <span>simplified</span>.
          </h1>
          <h3 className={styles.section_desc}>
            Whether for training, customer engagement, or pure fun, Choz brings together everything you need for a seamless and impactful quiz experience.
          </h3>
          <div className={styles.card_container}>
            {stepArr.map((step, index) => (
              <div className={styles.usage_card} key={index}>
                <div className={styles.usage_card_title_container}>
                  <p className={styles.usage_card_title_step}>{step.stepText}</p>
                  <h1 className={styles.usage_card_title}>{step.stepTitle}</h1>
                </div>
                <p className={styles.usage_card_desc}>{step.stepDesc}</p>
              </div>
            ))}
          </div>
          <div className={styles.section_button_container}>
            <Button variant="default" pill={true} size="default" icon={true} iconPosition="right">
              Create now <ArrowUpRightIcon className="size-6" />
            </Button>
            </div>
          </div>
        </section>

      {/* Text Message Section */}
      <section className={`${styles.section_container} ${styles.section_container_secondary}`}>
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
      <section className={styles.section_container}>
        <div className={styles.container}>
          <h5 className={styles.section_title}>OUR FEATURES</h5>
          <h1 className={styles.section_summary}>
            Meet <span>next generation</span> exam platform
          </h1>
          <h3 className={styles.section_desc}>
            We offer an experience you&apos;ve never used before with our unique
            features.
          </h3>
          <div className={styles.card_container}>
            {featureArr.map((feature, index) => (
              <div key={index} className={styles.feature_card_container}>
                <div className={styles.feature_card_text_container}>
                  <h1 className={styles.feature_card_title}>
                    {feature.featureTitle}
                  </h1>
                  <p className={styles.feature_card_desc}>{feature.featureDesc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className={`${styles.section_container} ${styles.section_container_secondary}`} >
        <div className={styles.container}>
          <h5 className={styles.section_title}>OUR TECHNOLOGIES</h5>
          <h1 className={styles.section_summary}>
            Choz <span>uses</span> these technologies
          </h1>
          <h3 className={styles.section_desc}>
            We provide a safe, fast and technological experience with the
            technologies we use.
          </h3>
          <div className={styles.card_container}>
            {techArr.map((tech, index) => (
              <div key={index} className={styles.tech_card_container}>
                <SparklesIcon className="size-8" />
                <div className={styles.tech_card_text_container}>
                  <h1 className={styles.tech_card_title}>{tech.techTitle}</h1>
                  <p className={styles.tech_card_desc}>{tech.techDesc}</p>
                </div>
                <div className={styles.tech_card_link_container}>
                  <Link
                    href={tech.techLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.techLink}
                  >
                    Learn more <ArrowUpRightIcon className="size-6" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sub CTA Section */}
      <section className={`${styles.section_container} ${styles.section_container_secondary}`}>
        <div className={styles.section_background}>
          <Image src={SUBCTA} alt="Sub CTA Background" className="w-full h-full object-cover" />
        </div>
        <div className={styles.sub_section_container}>      
          <div className={styles.container}>
          <div className={styles.sub_section_text_container}>
            It's rewarding, it's engaging, are you ready to dive in?
            </div>
          </div>
        </div>
      </section>

      {/* Supporters Section */}
      <section className={`${styles.supporters_container} ${styles.section_container_secondary}`}>
        <p>supported by</p>
        <Link href="https://minaprotocol.com/" target="_blank" rel="noopener noreferrer">
          <Image src={Mina} alt="Mina Protocol" className="w-full h-full object-cover" />
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer_container}>
        <div className={styles.logo_container}>
          <Image src={Choz} alt="Choz Logo" height={50} width={100} />
        </div>
        <p className={styles.copyright + " whitespace-nowrap"}>© 2024 Choz</p>
      </footer>
    </main>
  );
}
