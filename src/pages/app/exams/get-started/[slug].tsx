import styles from "@/styles/app/exams/get-started/ExamDetailScreen.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamDetails, startExam } from "@/lib/Client/Exam";
import { humanize } from "../../../../../utils/formatter";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../store";

import { authenticate, connectWallet } from "../../../../../hooks/auth";

//! Account düzelt

// Custom Layout
import Layout from "../layout";

// Icons
import ExamIcon from "@/icons/globe.svg";
import Clock from "@/icons/clock.svg";
import Choz from "@/icons/choz.svg";
import { isMobile } from "react-device-detect";
import toast from "react-hot-toast";
import { setSession } from "../../../../../features/client/session";
import { useEffect } from "react";

function ExamDetail() {
  const router = useRouter();
  const dispatch = useDispatch();
  const examID: string = router.query.slug as string;

  const session = useSelector(
    (state: { session: { userId: string; walletAddress: string } }) => state.session
  );

  const { data, isLoading, isPending, isError, refetch } = useQuery({
    queryKey: ["exam"],
    queryFn: () => getExamDetails(examID),
    enabled: !!examID, // Only fetch data when examID is available
  });

  // const data = undefined;
  // const isLoading = false;
  // const isPending = true;
  // const isError = false;

  console.log(data);

  useEffect(() => {
    if (data && typeof (data as any).exam?.isCompleted === "boolean") {
      if ((data as any).exam.isCompleted === true) {
        toast.error("This exam is already completed!");
        router.push("/app/exams/result/" + (data as any).exam._id);
      }
    }
  }, [data]);

  if (isLoading || isPending) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.content_container}>
            <div className={styles.card_container}>
              <div className={styles.card_inner_container}>
                <div className={styles.error_container}>
                  <h3 className={styles.try_again_title}>Are you bored? &#129393;</h3>
                  <p className={styles.try_again_desc}>
                    We are working hard to get the test details. Please wait a moment.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.footer_container}`}>
            <div className={styles.scale__container}>
              <Image src={Choz} alt="" />
              <div className={styles.footer_nav_container}>
                <a className={styles.footer_nav_item} href="#">
                  Overview
                </a>
                <a className={styles.footer_nav_item} href="#">
                  Blog
                </a>
                <a className={styles.footer_nav_item} href="#">
                  Docs
                </a>
              </div>
              <p className={styles.footer_copyright}>© 2024 Examina</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data && !isLoading && isError) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.content_container}>
            <div className={styles.card_container}>
              <div className={styles.card_inner_container}>
                <div className={styles.error_container}>
                  <h3 className={styles.try_again_title}>Something went wrong &#128553;</h3>
                  <p className={styles.try_again_desc}>
                    Probably this test is invalid or outdated. But you may want to try your luck
                    again. Please click this magic button for that.
                  </p>
                  <p className={styles.try_again_button} onClick={() => refetch()}>
                    TRY AGAIN
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.footer_container}`}>
            <div className={styles.scale__container}>
              <Image src={Choz} alt="" />
              <div className={styles.footer_nav_container}>
                <a className={styles.footer_nav_item} href="#">
                  Overview
                </a>
                <a className={styles.footer_nav_item} href="#">
                  Blog
                </a>
                <a className={styles.footer_nav_item} href="#">
                  Docs
                </a>
              </div>
              <p className={styles.footer_copyright}>© 2024 Examina</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content_container}>
          <div className={styles.card_container}>
            <div className={styles.card_inner_container}>
              <div className={styles.meta_container}>
                <p className={styles.invite_container}>
                  <span>{(data as any)?.exam.creator}</span> invited you to join
                </p>
                <div className={styles.title_container}>
                  <Image src={ExamIcon} alt="" />
                  <h3 title={(data as any)?.exam.title}>
                    {(data as any)?.exam.title.length > 25
                      ? `${(data as any)?.exam.title.substring(0, 25)}...`
                      : (data as any)?.exam.title}
                  </h3>
                </div>
                <div className={styles.deadline_container}>
                  <Image src={Clock} alt="" />
                  <p>{humanize((data as any).exam.startDate)}</p>
                </div>
              </div>
              <div className={styles.card_content_container}>
                <div className={styles.card_content_inner_container}>
                  <div className={styles.card_title}>
                    <h3 className={styles.card_title__bold}>Type</h3>
                    <p className={styles.card_title__normal}>Quiz</p>
                  </div>
                  <div className={styles.card_title}>
                    <h3 className={styles.card_title__bold}>Total Questions</h3>
                    <p className={styles.card_title__normal}>
                      {(data as any).exam.questionCount ? (data as any).exam.questionCount : "10"}
                    </p>
                  </div>
                  <div className={styles.card_title}>
                    <h3 className={styles.card_title__bold}>Duration</h3>
                    <p className={styles.card_title__normal}>
                      {(data as any).exam.duration} minutes
                    </p>
                  </div>
                </div>
                <div className={styles.card_content_inner_container}>
                  <div className={styles.card_title}>
                    <h3 className={styles.card_title__bold}>Description</h3>
                  </div>
                  <p className={styles.card_content}>{(data as any).exam.description}</p>
                </div>
              </div>
              <div className={styles.connect_container}>
                <div
                  className={styles.connect_button_container}
                  onClick={async () => {
                    if (session?.walletAddress && !isMobile) {
                      toast.loading("Starting exam...");
                      startExam(examID)
                        .then(() => {
                          router.push(`/app/exams/${(data as any).exam._id}`);
                          toast.remove();
                          toast.success("You are ready to start the exam. Good luck!");
                        })
                        .catch(() => {
                          toast.remove();
                          toast.error("Failed to start exam!");
                        });
                      return;
                    }
                    const res = await authenticate(session);
                    if (!res) {
                      toast.error("Failed to authenticate wallet!");
                      return;
                    }
                    toast.success("Successfully authenticated wallet!");
                    dispatch(setSession((res as any).session));
                    router.reload();
                  }}
                >
                  <p className={styles.connect_button_text}>
                    {session?.walletAddress ? "Start Exam" : "Connect Wallet"}
                  </p>
                </div>
                {session?.walletAddress ? (
                  <p className={styles.connect_container_desc_connected}>
                    You are using this wallet address:{" "}
                    <a
                      href={`https://minascan.io/mainnet/account/${session?.walletAddress}/`}
                      target="_blank"
                    >
                      {session?.walletAddress &&
                        `${(session?.walletAddress).slice(0, 5)}...${(session?.walletAddress).slice(
                          -5
                        )}`}
                    </a>
                  </p>
                ) : isMobile ? (
                  <p className={styles.connect_container_desc}>
                    You have to use desktop browser to join exam.{" "}
                  </p>
                ) : (
                  <p className={styles.connect_container_desc}>
                    You must have an Auro Wallet account before using it. Not there yet?{" "}
                    <a href="#">Create now!</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* <div className={`${styles.footer_container}`}>
          <div className={styles.scale__container}>
            <Image src={Choz} alt="" />
            <div className={styles.footer_nav_container}>
              <a className={styles.footer_nav_item} href="#">
                Overview
              </a>
              <a className={styles.footer_nav_item} href="#">
                Blog
              </a>
              <a className={styles.footer_nav_item} href="#">
                Docs
              </a>
            </div>
            <p className={styles.footer_copyright}>©2024 Choz</p>
          </div>
        </div> */}
      </div>
    </Layout>
  );
}

export default ExamDetail;
