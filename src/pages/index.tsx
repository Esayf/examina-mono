"use client";
import styles from "../styles/Landing.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

// import { initialState } from '../../features/client/session';
// Components

// Images
import BG from "@/images/landing-bg.png";
// import Team from '@/images/landing_team/team.svg';
import Try from "@/images/landing_general/try_now.svg";
import TryButton from "@/images/landing_general/try_button.svg";
import Mina from "@/images/landing_general/mina.svg";

import STEP1 from "@/images/landing_step_card/step_1.svg";
import STEP2 from "@/images/landing_step_card/step_2.svg";
import STEP3 from "@/images/landing_step_card/step_3.svg";

import FEATURE1 from "@/images/landing_feature_card/feature_1.svg";
import FEATURE2 from "@/images/landing_feature_card/feature_2.svg";
import FEATURE3 from "@/images/landing_feature_card/feature_3.svg";
import FEATURE4 from "@/images/landing_feature_card/feature_4.svg";
import FEATURE5 from "@/images/landing_feature_card/feature_5.svg";
import FEATURE6 from "@/images/landing_feature_card/feature_6.svg";

// Icons
import RightLong from "@/icons/right_long.svg";
import RightLongPurple from "@/icons/right_long_purple.svg";
import Choz from "@/icons/choz.svg";
import { authenticate } from "@/hooks/auth";
import { initialState, setSession } from "@/features/client/session";
import { useAppDispatch, useAppSelector, useAppStore } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
const stepArr = [
  {
    stepText: "STEP 1",
    stepTitle: "Connect",
    stepDesc:
      "Seamlessly connect via the Auro Wallet by simply pressing the 'Connect Wallet' button.",
    stepImage: STEP1,
  },
  {
    stepText: "STEP 2",
    stepTitle: "Create",
    stepDesc: "Navigate to the exam creation page and fill in your questions and answers.",
    stepImage: STEP2,
  },
  {
    stepText: "STEP 3",
    stepTitle: "Publish",
    stepDesc: "Publish your exam and you are good to go!",
    stepImage: STEP3,
  },
];

const featureArr = [
  {
    featureTitle: "Secure",
    featureDesc:
      "Experience the pinnacle of security with our cutting-edge exam system fortified by next-generation blockchain technology powered by Mina Protocol",
    featureImage: FEATURE1,
  },
  {
    featureTitle: "Fast",
    featureDesc:
      "Effortless registration and exam entry: No email or password needed – just use your Auro Wallet and start your journey seamlessly!",
    featureImage: FEATURE2,
  },
  {
    featureTitle: "Free",
    featureDesc:
      "Enjoy the freedom – register and create your exam in just a minute, absolutely free!",
    featureImage: FEATURE3,
  },
  {
    featureTitle: "Private",
    featureDesc:
      "Your privacy is paramount to us! Rest assured, we do not retain any private information about you, encompassing your test scores and identity.",
    featureImage: FEATURE4,
  },
  {
    featureTitle: "Decentralized",
    featureDesc:
      "Blockchain empowers secure global connectivity, enabling seamless connections to anywhere in the world.",
    featureImage: FEATURE5,
  },
  {
    featureTitle: "Smart",
    featureDesc:
      "Utilize the intelligence of our Choz Smart Contract, seamlessly integrating external exams for a more efficient and technologically advanced system.",
    featureImage: FEATURE6,
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

// const linkedinArr = [
//   'https://www.linkedin.com/in/sametdokmeci/',
//   'https://www.linkedin.com/in/yavuz-selim-tun%C3%A7er-6634581b4/',
//   'https://www.linkedin.com/in/uiesraakyazi/',
//   'https://www.linkedin.com/in/feyyaz-numan-cavlak/',
// ];

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const session = useAppSelector((state) => state.session);
  return (
    <>
      <div className={styles.landing_header_container}>
        <div className={styles.container}>
          <div className={styles.logo_container}>
            <Image src={Choz} alt="" />
          </div>
          <div className={styles.navigation_container}>
            <Link
              rel="noopener noreferrer"
              target="_blank"
              className={styles.link_no_decoration}
              href="https://github.com/Esayf"
            >
              <p className={styles.nav_button}>Docs</p>
            </Link>
            <Link
              rel="noopener noreferrer"
              target="_blank"
              className={styles.link_no_decoration}
              href="https://examina.medium.com/"
            >
              <p className={styles.nav_button}>Blog</p>
            </Link>
            <p className={styles.nav_button}>Features</p>
          </div>
          <div
            className={styles.button_container}
            onClick={async () => {
              const res = await authenticate(session as any);
              if (!res) {
                toast.error("Failed to authenticate wallet!");
                return;
              }
              toast.success("Welcome back!");
              console.log("redirect res", (res as any).session);
              dispatch(setSession((res as any).session));
              window.location.href = "/app"; // You are terrible at this
            }}
          >
            {store.getState().session.session === initialState.session ? (
              <Button variant="outline" pill={true}>
                Connect <ArrowUpRightIcon className="size-6" />
              </Button>
            ) : (
              <Button variant="outline" pill={true}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.hero_container}>
        <div className={styles.container}>
          <div className={styles.content_container}>
            <h5 className={styles.hero_summary}>Blockchain Tech Based Online Exam Platform</h5>
            <h1 className={styles.hero_title}>Create, join, test</h1>
            <h3 className={styles.hero_desc}>
              Choz: Setting the New Standard for Secure Exam Creation
            </h3>
            <button className={styles.hero_button}>Create your exam</button>
          </div>
        </div>
      </div>
      <Image src={BG} alt="" className={styles.hero_bg} />
      <div className={styles.section_container}>
        <div className={styles.container}>
          <h5 className={styles.section_title}>HOW IT WORKS</h5>
          <h1 className={styles.section_summary}>
            The <span>fastest</span> way to create exam
          </h1>
          <h3 className={styles.section_desc}>
            With Choz, you can create an exam in 3 stages and share your exam with a single click.
          </h3>
          <div className={styles.card_container}>
            {stepArr.map((step, index) => {
              return (
                <div className={styles.usage_card} key={index}>
                  <Image src={step.stepImage} alt="" />
                  <div className={styles.usage_card_title_container}>
                    <p className={styles.usage_card_title_step}>{step.stepText}</p>
                    <h1 className={styles.usage_card_title}>{step.stepTitle}</h1>
                  </div>
                  <p className={styles.usage_card_desc}>{step.stepDesc}</p>
                </div>
              );
            })}
          </div>
          <div className={styles.section_button_container}>
            <button className={styles.section_button}>
              Create now <Image src={RightLong} alt="" />
            </button>
          </div>
        </div>
      </div>
      <div className={`${styles.section_container} ${styles.section_container_secondary}`}>
        <div className={styles.container}>
          <h5 className={styles.section_title}>OUR FEATURES</h5>
          <h1 className={styles.section_summary}>
            Meet <span>next generation</span> exam platform
          </h1>
          <h3 className={styles.section_desc}>
            We offer an experience you've never used before with our unique features.
          </h3>
          <div className={styles.card_container}>
            {featureArr.map((feature, index) => {
              return (
                <div key={index} className={styles.feature_card_container}>
                  <Image src={feature.featureImage} alt="" />
                  <div className={styles.feature_card_text_container}>
                    <h1 className={styles.feature_card_title}>{feature.featureTitle}</h1>
                    <p className={styles.feature_card_desc}>{feature.featureDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.section_container}>
        <div className={styles.container}>
          <h5 className={styles.section_title}>OUR TECHNOLOGIES</h5>
          <h1 className={styles.section_summary}>
            Choz <span>uses</span> these technologies
          </h1>
          <h3 className={styles.section_desc}>
            We provide a safe, fast and technological experience with the technologies we use.
          </h3>
          <div className={styles.card_container}>
            {techArr.map((tech, index) => {
              return (
                <div key={index} className={styles.tech_card_container}>
                  <div className={styles.tech_card_text_container}>
                    <h1 className={styles.tech_card_title}>{tech.techTitle}</h1>
                    <p className={styles.tech_card_desc}>{tech.techDesc}</p>
                  </div>
                  <div className={styles.tech_card_link_container}>
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      href={tech.techLink}
                      className={styles.techLink}
                    >
                      Learn more <Image src={RightLongPurple} alt="" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* <div className={styles.section_container}>
        <div className={styles.container}>
          <h5 className={styles.section_title}>OUR TEAM</h5>
          <h1 className={styles.section_summary}>Meet our team</h1>
          <div className={styles.team_image_container}>
            <Image src={Team} alt="" className={styles.team_image} />
            {linkedinArr.map((el, i) => {
              return (
                <a className={styles.team_linkedin_button} key={i} href={el} target="_blank" />
              );
            })}
          </div>
        </div>
      </div> */}
      <div className={styles.sub_section_container}>
        <div className={styles.container}>
          <div className={styles.sub_section_text_container}>
            <Image src={Try} alt="" className={styles.sub_section_image} />
            <p className={styles.sub_section_desc}>
              You must have an auro wallet account before using it. Not there yet?{" "}
              <a rel="noopener noreferrer" target="_blank" href="https://www.aurowallet.com/">
                Create now
              </a>
            </p>
          </div>
          <a href="#" className={styles.sub_section_try_button_container}>
            <Image src={TryButton} alt="" className={styles.sub_section_try_button} />
          </a>
        </div>
      </div>
      <div className={styles.footer_container}>
        <div className={styles.container}>
          <div className={styles.supporters_container}>
            <p>supported by</p>
            <Link rel="noopener noreferrer" target="_blank" href="https://minaprotocol.com/">
              <Image src={Mina} alt="" />
            </Link>
          </div>
          <div className={styles.footer}>
            <div className={styles.container}>
              <div className={styles.logo_container}>
                <Image src={Choz} alt="" />
              </div>
              <p className={styles.copyright}>© 2024 Choz</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
