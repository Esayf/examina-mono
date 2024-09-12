import styles from "@/styles/app/exams/get-started/ExamDetailScreen.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamDetails, startExam } from "@/lib/Client/Exam";

import { authenticate, connectWallet } from "../../../../hooks/auth";

//! Account düzelt

// Custom Layout
import Layout from "../layout";

// Icons
import ExamIcon from "@/icons/globe.svg";
import Clock from "@/icons/clock.svg";
import Choz from "@/icons/choz.svg";
import { isMobile } from "react-device-detect";
import toast from "react-hot-toast";
import { setSession } from "@/features/client/session";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { humanize } from "@/utils/formatter";
import { Button } from "@/components/ui/button";

function ExamDetail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const examID: string = router.query.slug as string;

  const session = useAppSelector((state) => state.session);

  const isConnected = Object.keys(session.session).length > 0;

  const { data, isLoading, isPending, isError, refetch } = useQuery({
    queryKey: ["exam"],
    queryFn: () => getExamDetails(examID),
    enabled: !!examID && isConnected,
  });

  useEffect(() => {
    if (!data) return;

    if ("message" in data) {
      toast.error(data.message);
      return;
    }

    if (data.exam?.isCompleted === true) {
      toast.error("This exam is already completed!");
      router.push("/app/exams/result/" + data.exam?._id);
    }
  }, [data]);

  if (isConnected && (isLoading || isPending)) {
    return (
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
    );
  }

  if ((!data && !isLoading && isError) || (data && "message" in data)) {
    return (
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
    );
  }

  const canStartExam = data?.exam.startDate && new Date(data?.exam.startDate) < new Date();

  return (
    <div className={styles.container}>
      <div className={styles.content_container}>
        <div className={styles.card_container}>
          <div className={styles.card_inner_container}>
            <div
              className={styles.meta_container}
              style={{
                ...(!data && {
                  filter: "blur(5px)",
                }),
              }}
            >
              <p className={styles.invite_container}>
                <span>{data?.exam.creator}</span> invited you to join
              </p>
              <div className={styles.title_container}>
                <Image src={ExamIcon} alt="" />
                <h3 title={data?.exam.title}>
                  {data?.exam?.title && data?.exam?.title?.length > 25
                    ? `${data?.exam.title.substring(0, 25)}...`
                    : data?.exam.title}
                </h3>
              </div>
              <div className={styles.deadline_container}>
                <Image src={Clock} alt="" />
                <p>{data && humanize(new Date(data.exam.startDate))}</p>
              </div>
            </div>
            <div
              className={styles.card_content_container}
              style={{
                ...(!data && {
                  filter: "blur(5px)",
                }),
              }}
            >
              <div className={styles.card_content_inner_container}>
                <div className={styles.card_title}>
                  <h3 className={styles.card_title__bold}>Type</h3>
                  <p className={styles.card_title__normal}>Quiz</p>
                </div>
                <div className={styles.card_title}>
                  <h3 className={styles.card_title__bold}>Total Questions</h3>
                  <p className={styles.card_title__normal}>
                    {data?.exam.questionCount ? data?.exam.questionCount : "10"}
                  </p>
                </div>
                <div className={styles.card_title}>
                  <h3 className={styles.card_title__bold}>Duration</h3>
                  <p className={styles.card_title__normal}>{data?.exam.duration} minutes</p>
                </div>
              </div>
              <div className={styles.card_content_inner_container}>
                <div className={styles.card_title}>
                  <h3 className={styles.card_title__bold}>Description</h3>
                </div>
                <p className={styles.card_content}>{data?.exam.description}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                className="self-center"
                disabled={!canStartExam && isConnected}
                onClick={async () => {
                  if (isConnected && !isMobile) {
                    toast.loading("Starting exam...");
                    startExam(examID)
                      .then(() => {
                        router.push(`/app/exams/${data?.exam._id}`);
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

                  dispatch(setSession(res));
                }}
              >
                {session.session?.walletAddress ? "Start Exam" : "Connect Wallet"}
              </Button>
              {session.session?.walletAddress ? (
                <p className={styles.connect_container_desc_connected}>
                  You are using this wallet address:{" "}
                  <a
                    href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
                    target="_blank"
                  >
                    {session.session?.walletAddress &&
                      `${(session.session?.walletAddress).slice(
                        0,
                        5
                      )}...${(session.session?.walletAddress).slice(-5)}`}
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
  );
}

export default ExamDetail;
