import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/components/DashboardCarousel.module.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { PersonIcon, ClockIcon } from "@radix-ui/react-icons";

import LeftArrow from "@/icons/carousel-left.svg";
import RightArrow from "@/icons/carousel-right.svg";

type Exam = {
  title: string;
  description: string;
  date: string;
  duration: string;
  owner: string;
  participants: string;
};

type Props = {
  type: "Upcoming" | "Ongoing" | "Inreview";
  exams?: Exam[];
  step: number;
  stepper: (step: number) => void;
};

const lights = {
  Upcoming: "#FFE0A1",
  Ongoing: "#CCEBD7",
  Inreview: "#CEE7FE",
};

function CarouselComponent({ type, exams = [], step = 0, stepper = () => {} }: Props) {
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    carouselRef.current?.moveTo(step);
  }, [step]);

  const incrementStep = () => {
    if (step === exams.length - 1) {
      stepper(0);
      return;
    }
    stepper(step + 1);
  };

  const decrementStep = () => {
    if (step === 0) {
      stepper(exams.length - 1);
      return;
    }
    stepper(step - 1);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.carousel_title}>{type}</h1>
      {exams.length === 0 && <div className={styles.empty}>No exams available</div>}
      <div
        className={styles.carousel_container}
        style={exams.length < 2 ? { padding: "0 3rem" } : {}}
      >
        {exams.length > 1 && (
          <Image src={LeftArrow} className={styles.arrow} alt="" onClick={() => decrementStep()} />
        )}
        <Carousel
          showArrows={false}
          showIndicators={false}
          showStatus={false}
          showThumbs={false}
          className={styles.carousel}
          ref={carouselRef}
        >
          {exams.map((exam, _i) => (
            <div key={_i} className={styles.card_container}>
              <div className={styles.highlighter} style={{ backgroundColor: lights[type] }} />
              <div className={styles.card_content_container}>
                <div className={styles.general}>
                  <div className={styles.title_container}>
                    <div className={styles.title}>{exam.title}</div>
                    <div className={styles.description}>{exam.description}</div>
                  </div>
                  <div className={styles.duration_container}>
                    <ClockIcon className={styles.duration_icon} />
                    <p className={styles.duration}>{exam.duration} Minutes</p>
                  </div>
                </div>
                <div className={styles.owner_container}>
                  <PersonIcon className={styles.owner_icon} />
                  <p className={styles.owner}>{exam.owner}</p>
                </div>
                <div className={styles.nav_container}>
                  <div className={styles.participants}>{exam.participants} Participants</div>
                  <div className={styles.button}>Details</div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
        {exams.length > 1 && (
          <Image src={RightArrow} className={styles.arrow} alt="" onClick={() => incrementStep()} />
        )}
      </div>
    </div>
  );
}

export default CarouselComponent;
