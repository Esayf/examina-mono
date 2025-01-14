import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamDetails, startExam } from "@/lib/Client/Exam";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { authenticate } from "@/hooks/auth";

// Icons
import Choz from "@/images/landing-header/choz.svg";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { isMobile } from "react-device-detect";
import toast from "react-hot-toast";
import { setSession } from "@/features/client/session";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClockIcon } from "@heroicons/react/24/outline";
import BackgroundPattern from "@/images/backgrounds/backgroundpattern.svg";
import { ClipboardDocumentIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

function Footer() {
  return (
    <div className="w-full bg-white/80 py-5 px-5">
      <div className="flex justify-between items-center gap-8">
        <Image src={Choz} alt="" />
        <div className="hidden md:flex gap-8 items-center">
          <a className="font-bold" href="#">
            Overview
          </a>
          <a className="font-bold" href="#">
            Blog
          </a>
          <a className="font-bold" href="#">
            Docs
          </a>
        </div>
        <p>© 2024 Choz</p>
      </div>
    </div>
  );
}

function ExamDetail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const examID: string = router.query.slug as string;
  const session = useAppSelector((state) => state.session);
  const isConnected = Object.keys(session.session).length > 0;

  const [timer, setTimer] = useState<number>(0);

  const { data, isLoading, isPending, isError, refetch } = useQuery({
    queryKey: ["exam"],
    queryFn: () => getExamDetails(examID),
    enabled: !!examID && isConnected,
  });

  // Initialize timer
  useEffect(() => {
    if (data === undefined || "message" in data) return;
    if (data?.exam?.startDate && timer === 0) {
      setTimer(new Date(data.exam.startDate).getTime() - new Date().getTime());
    }
  }, [data]);

  // Decrement timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  /**
   * A fun, user-friendly countdown/quiz state function.
   */
  const formatTimeLeft = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // If we still have positive time => exam hasn't started
    if (totalSeconds > 0) {
      if (minutes > 1) {
        return `Woohoo! ${minutes} minutes left until we kick off!`;
      } else if (minutes === 1) {
        return `Just 1 minute and ${seconds} seconds until the fun begins!`;
      } else if (seconds > 0) {
        return `Only ${seconds} seconds to go—get ready!`;
      }
    }

    // totalSeconds <= 0 => exam may be started or ended
    if (data && "exam" in data) {
      const timeSinceStart = Math.abs(milliseconds);
      const examDurationMs = (data.exam?.duration ?? 0) * 60 * 1000;

      // If we've surpassed the duration => ended
      if (timeSinceStart >= examDurationMs) {
        return "Oh no! The quiz has ended. Better luck next time!";
      }

      // Otherwise, it started but isn't over
      return "It's go time! The quiz is in progress—join before it ends!";
    }

    return "Loading or invalid data...";
  };

  // If exam is completed or user finished, redirect to results
  useEffect(() => {
    if (!data) return;

    if ("message" in data) {
      toast.error(data.message);
      return;
    }

    if (data.exam?.isCompleted === true && data.participatedUser) {
      router.push("/app/exams/result/" + data.exam._id);
    }
    if (data.participatedUser && data.participatedUser.isFinished) {
      router.push("/app/exams/result/" + data.exam._id);
    }
  }, [data]);

  // Loading states
  if (isConnected && (isLoading || isPending)) {
    return (
      <div className="flex w-full justify-center flex-col items-center h-dvh bg-[url('/bg.png')] bg-cover">
        <div className="flex flex-col items-center justify-center flex-1">
          <Card className="max-w-[36rem] w-full px-10 py-16 gap-4 flex flex-col">
            <b>Are you bored? &#129393;</b>
            <p>We are working hard to get the test details. Please wait a moment.</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if ((!data && !isLoading && isError) || (data && "message" in data)) {
    return (
      <div className="flex w-full justify-center flex-col items-center h-dvh bg-[url('/bg.png')] bg-cover">
        <div className="flex flex-col items-center justify-center flex-1">
          <Card className="max-w-[36rem] w-full px-10 py-16 gap-4 flex flex-col">
            <b>Something went wrong &#128553;</b>
            <p>
              Probably this test is invalid or outdated. But you may want to try your
              luck again. Please click this magic button for that.
            </p>
            <Button variant="ghost" className="self-start" onClick={() => refetch()}>
              TRY AGAIN
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If exam start is in the past and end time not passed => canStartExam = true
  const canStartExam =
    data?.exam?.startDate &&
    new Date(data?.exam?.startDate) < new Date() &&
    new Date(data?.exam?.startDate).getTime() + (data?.exam?.duration ?? 0) * 60 * 1000 >
      Date.now();

  return (
    <div className="flex justify-center items-center h-dvh">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center h-dvh"
      />
      <Card className="max-w-[56rem] w-full px-10 pb-16 pt-12 bg-base-white z-10">
        <CardContent className="gap-9 flex flex-col">
          <div className={cn("flex flex-col items-center", !data && "filter blur-sm")}>
            <div className="flex items-center gap-3 my-4 font-bold text-center text-xl border-none border-greyscale-light-200 rounded-2xl p-4">
              <h3
                title={data?.exam.title}
                className="
                  text-brand-primary-950
                  text-center
                  font-semibold
                  mx-auto
                  text-2xl sm:text-xl md:text-2xl lg:text-3xl
                  max-w-[360px] sm:max-w-[480px] md:max-w-[640px] lg:max-w-[720px]
                  overflow-x-auto
                  break-normal
                  break-words
                "
              >
                {data?.exam.title}
              </h3>
            </div>
            <div className="flex items-center text-center max-w-[480px] justify-center gap-2">
              {/* If timer != 0, use formatTimeLeft. Otherwise, "Quiz has started" */}
              <p>{timer !== 0 ? formatTimeLeft(timer) : "Quiz has started"}</p>
            </div>
          </div>
          <div className={cn("flex flex-col gap-4", !data && "filter blur-sm")}>
            {/* Additional quiz info */}
            <div className="border rounded-2xl border-greyscale-light-200 p-4 bg-white space-y-3">
              {/* Type */}
              <div className="flex items-center gap-2">
                <ClipboardDocumentIcon className="w-5 h-5 text-brand-primary-950" />
                <span className="text-sm text-greyscale-light-700">
                  Type: <span className="font-bold">Quiz</span>
                </span>
              </div>
              {/* Total Questions */}
              <div className="flex items-center gap-2">
                <Squares2X2Icon className="w-5 h-5 text-brand-primary-950" />
                <span className="text-sm text-greyscale-light-700">
                  Total Questions: <span className="font-bold">5</span>
                </span>
              </div>
              {/* Duration */}
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-brand-primary-950" />
                <span className="text-sm text-greyscale-light-700">
                  Duration: <span className="font-bold">{data?.exam?.duration ?? 120} minutes</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div
              className="
                min-h-[160px]
                rounded-2xl
                border
                border-greyscale-light-200
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  mt-1
                  text-base
                  text-greyscale-light-700
                  font-light
                  leading-relaxed
                  max-h-[240px]
                  overflow-y-auto
                  whitespace-normal
                  break-normal
                "
              >
                <ReactMarkdown className="mdxeditor" remarkPlugins={[remarkGfm]}>
                  {data?.exam?.description ?? ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            {session.session?.walletAddress ? (
              <Button
                variant="default"
                size="default"
                icon
                iconPosition="right"
                className="self-center"
                disabled={!canStartExam && isConnected}
                onClick={() => {
                  toast.loading("Starting exam...");
                  startExam(examID)
                    .then(() => {
                      router.push(`/app/exams/${data?.exam._id}`);
                      toast.remove();
                      toast.success("You are ready to start the exam. Good luck!");
                    })
                    .catch((error) => {
                      console.log(error);
                      toast.remove();
                      toast.error("Failed to start exam!");
                    });
                }}
              >
                Join quiz <ArrowUpRightIcon className="size-4" />
              </Button>
            ) : (
              <Button
                icon
                iconPosition="right"
                className="self-center"
                onClick={async () => {
                  const res = await authenticate(session);
                  if (!res) {
                    toast.error("Failed to authenticate wallet!");
                    return;
                  }
                  toast.success("Successfully authenticated wallet!");
                  dispatch(setSession(res));
                }}
              >
                Connect wallet
                <ArrowUpRightIcon className="size-4" />
              </Button>
            )}

            <p className="mt-auto text-center text-sm">
              {session.session?.walletAddress ? (
                <>
                  Your current wallet address is:{" "}
                  <a
                    href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
                    target="_blank"
                    className="font-bold"
                  >
                    {session.session?.walletAddress &&
                      `${session.session?.walletAddress.slice(0, 5)}...${session.session?.walletAddress.slice(-5)}`}
                  </a>
                </>
              ) : isMobile ? (
                "You have to use desktop browser to join this quiz."
              ) : (
                <>
                  You must have an MINA wallet account before using it. Not there yet?{" "}
                  <a
                    className="font-bold"
                    href="https://www.aurowallet.com/download/"
                    target="_blank"
                  >
                    Create now!
                  </a>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExamDetail;
