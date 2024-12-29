import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamDetails, startExam } from "@/lib/Client/Exam";

import { authenticate } from "../../../../hooks/auth";

// Icons
import Choz from "@/images/landing-header/choz.svg";
import { ArrowUpRightIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { isMobile } from "react-device-detect";
import toast from "react-hot-toast";
import { setSession } from "@/features/client/session";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { humanize } from "@/utils/formatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import BackgroundPattern from "@/images/backgrounds/backgroundpattern.svg";

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
        <p>© 2024 Examina</p>
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

  useEffect(() => {
    if (data === undefined || "message" in data) return;
    if (data?.exam?.startDate && timer === 0) {
      setTimer(new Date(data.exam.startDate).getTime() - new Date().getTime());
    }
  }, [data]);

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

  const formatTimeLeft = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 1) {
      return `Starts in ${minutes} minutes`;
    } else if (minutes === 1) {
      return `Starts in ${minutes} minute and ${seconds} seconds`;
    } else if (seconds > 0) {
      return `Starts in ${seconds} seconds`;
    } else {
      if (data && "exam" in data && Math.abs(timer) >= (data.exam?.duration ?? 0) * 60 * 1000) {
        return "Oopps! 🥴 Quiz has ended. You can't join this quiz.";
      }
      return `Exam has started ${
        Math.abs(minutes) > 0 ? Math.abs(minutes) + " minutes" : Math.abs(seconds) + " seconds"
      } ago`;
    }
  };

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
              Probably this test is invalid or outdated. But you may want to try your luck again.
              Please click this magic button for that.
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

  const canStartExam =
    data?.exam?.startDate &&
    new Date(data?.exam?.startDate) < new Date() &&
    new Date(data?.exam?.startDate).getTime() + data?.exam?.duration * 60 * 1000 >
      new Date().getTime();

  return (
    <div className="flex justify-center items-center h-dvh">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center h-dvh"
      />
      <Card className="max-w-[36rem] w-full px-10 pb-16 pt-12 bg-base-white z-10">
        <CardContent className="gap-9 flex flex-col">
          <div className={cn("flex flex-col items-center", !data && "filter blur-sm")}>
            {/*           <p className="text-sm font-semibold text-brand-primary-950">
              <b>{data?.exam.creator}</b>{" "}
              <span className="text-brand-primary-950 font-light">invited you to join this quiz</span>
            </p> */}
            <div className="flex items-center gap-3 my-4 font-bold text-center text-xl border-none border-greyscale-light-200 rounded-2xl p-4">
              <RocketLaunchIcon className="size-7 stroke-brand-primary-950 stroke-2" />
              <h3
                title={data?.exam.title}
                className="text-brand-primary-950 text-center max-w-[360px] overflow-x-auto break-all overflow-wrap"
              >
                {data?.exam.title}
              </h3>
            </div>
            <div className="flex items-center text-center max-w-[360px] justify-center gap-2">
              <ClockIcon className="size-6 stroke-greyscale-light-700" />
              <p>{timer != 0 ? formatTimeLeft(timer) : "Quiz has started"}</p>
            </div>
          </div>
          <div className={cn("flex flex-col gap-4", !data && "filter blur-sm")}>
            <div className="border rounded-2xl border-greyscale-light-200 p-4">
              <div className="flex justify-between text-sm">
                <b>Type</b>
                <p>Quiz</p>
              </div>
              <div className="flex justify-between text-sm">
                <b>Total Questions</b>
                <p>{data?.exam.questionCount ? data?.exam.questionCount : "10"}</p>
              </div>
              <div className="flex justify-between text-sm">
                <b>Duration</b>
                <p>{data?.exam.duration} minutes</p>
              </div>
            </div>
            <div className="border-none min-h-[160px] rounded-2xl border-greyscale-light-200 p-4">
              <p className="mt-1 flex-col max-h-[240px] text-base text-greyscale-light-700 font-light leading-5 overflow-y-auto overflow-x-hidden break-all overflow-wrap">
                {data?.exam.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {session.session?.walletAddress ? (
              <Button
                variant="default"
                size="default"
                icon={true}
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
                icon={true}
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

            <p className="mt-auto text-center text-sm ">
              {session.session?.walletAddress ? (
                <>
                  Your current wallet address is:{" "}
                  <a
                    href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}/`}
                    target="_blank"
                    className="font-bold"
                  >
                    {session.session?.walletAddress &&
                      `${(session.session?.walletAddress).slice(
                        0,
                        5
                      )}...${(session.session?.walletAddress).slice(-5)}`}
                  </a>
                </>
              ) : isMobile ? (
                "You have to use desktop browser to join this quiz."
              ) : (
                <>
                  You must have an wallet account before using it. Not there yet?{" "}
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
