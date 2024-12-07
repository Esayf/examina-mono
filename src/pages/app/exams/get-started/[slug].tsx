import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamDetails, startExam } from "@/lib/Client/Exam";

import { authenticate } from "../../../../hooks/auth";

// Icons
import Choz from "@/images/landing-header/choz.svg";
import { ArrowUpRightIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
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
      if(data && "exam" in data && Math.abs(timer) >= (data.exam?.duration ?? 0) * 60 * 1000) {
        return "Exam has ended";
      }
      return `Exam has started ${Math.abs(minutes) > 0 ? Math.abs(minutes) + " minutes" : Math.abs(seconds) + " seconds"} ago`;
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
    if(data.participatedUser && data.participatedUser.isFinished) {
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

  const canStartExam = data?.exam?.startDate && new Date(data?.exam?.startDate) < new Date() && new Date(data?.exam?.startDate).getTime() + data?.exam?.duration * 60 * 1000 > new Date().getTime();

  return (
    <div className="flex justify-center items-center h-dvh">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center h-dvh"
      />
      <Card className="max-w-[36rem] w-full px-10 py-16 bg-base-white z-10">
        <CardContent className="gap-9 flex flex-col">
          <div className={cn("flex flex-col items-center", !data && "filter blur-sm")}>
  {/*           <p className="text-sm font-semibold text-brand-primary-950">
              <b>{data?.exam.creator}</b>{" "}
              <span className="text-brand-primary-950 font-light">invited you to join this quiz</span>
            </p> */}
            <div className="flex items-center gap-3 my-4">
              <ComputerDesktopIcon className="size-6" />
              <h3 title={data?.exam.title}>
                {data?.exam.title && data?.exam.title?.length > 25
                  ? `${data?.exam.title.substring(0, 25)}...`
                  : data?.exam.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4" />
              <p>{timer != 0 ? formatTimeLeft(timer) : "Exam has started"}</p>
            </div>
          </div>
          <div className={cn("flex flex-col gap-7", !data && "filter blur-sm")}>
            <div className="border rounded-2xl border-primary p-4">
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
            <div className="border rounded-2xl border-primary p-4">
              <div className="flex justify-between text-sm">
                <b>Description</b>
              </div>
              <p className="mt-2">{data?.exam.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {session.session?.walletAddress ? (
              <Button
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
                      console.log(error)
                      toast.remove();
                      toast.error("Failed to start exam!");
                    });
                }}
              >
                Start exam
              </Button>
            ) : (
              <Button
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
                "You have to use desktop browser to join exam."
              ) : (
                <>
                  You must have an Auro Wallet account before using it. Not there yet?{" "}
                  <a className="font-bold" href="#">
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
