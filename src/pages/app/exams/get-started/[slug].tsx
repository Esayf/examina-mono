import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import {
  ArrowUpRightIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getExamDetails, startExam } from "@/lib/Client/Exam";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSession } from "@/features/client/session";
import { authenticate } from "@/hooks/auth";

import Choz from "@/images/landing-header/choz.svg";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import DurationFormatter from "@/components/ui/time/duration-formatter";
function ExamDetail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const examID: string = router.query.slug as string;
  const session = useAppSelector((state) => state.session);
  const isConnected = Object.keys(session.session).length > 0;

  // Saniyede bir güncellediğimiz "kalan süre" state
  const [timer, setTimer] = useState<number>(0);

  // Sınav detaylarını çek
  const { data, isLoading, isPending, isError, refetch } = useQuery({
    queryKey: ["exam"],
    queryFn: () => getExamDetails(examID),
    enabled: !!examID && isConnected,
  });

  // “kalan süre”’yi her saniye hesaplayan effect
  useEffect(() => {
    if (!data || "message" in data || !data.exam?.startDate) return;

    // Her seferinde “şimdi - examStartDate” farkını yeniden hesaplamak için bir fonksiyon
    const calcTime = () => {
      const distance = new Date(data.exam.startDate).getTime() - new Date().getTime();
      setTimer(distance);
    };

    // İlk hesap
    calcTime();

    // Saniyede bir yeniden hesap
    const intervalId = setInterval(calcTime, 1000);
    return () => {
      clearInterval(intervalId);
      setTimer(0);
    };
  }, [data]); // data.exam?.startDate gibi de ekleyebilirsiniz

  /**
   * Geriye kalan süreye göre kullanıcıya durum mesajı
   */
  const formatTimeLeft = (milliseconds: number) => {
    if (!data || !("exam" in data)) return "Loading or invalid data...";

    const totalSeconds = Math.floor(milliseconds / 1000);
    if (totalSeconds > 0) {
      // Sınav henüz başlamadı
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (minutes > 1) return `Woohoo! ${minutes} minutes left until we kick off!`;
      if (minutes === 1) return `Just 1 minute and ${seconds} seconds until the fun begins!`;
      if (seconds > 0) return `Only ${seconds} seconds to go—get ready!`;
    }

    // totalSeconds <= 0 => exam started or ended
    const timeSinceStart = Math.abs(milliseconds);
    const examDurationMs = (data.exam?.duration ?? 0) * 60 * 1000;

    if (timeSinceStart >= examDurationMs) {
      return "Oh no! The quiz has ended. Better luck next time!";
    }
    return "It's go time! The quiz is in progress—join before it ends!";
  };

  // Sınav bitmiş veya kullanıcı bitirmişse result'a yönlendir
  useEffect(() => {
    if (!data) return;
    if ("message" in data) {
      toast.error(data.message);
      return;
    }
    if (data.exam?.isCompleted && data.participatedUser) {
      router.push("/app/exams/result/" + data.exam._id);
    } else if (data.participatedUser?.isFinished) {
      router.push("/app/exams/result/" + data.exam._id);
    }
  }, [data]);

  // Bazı loading / error durumları
  if (isConnected && (isLoading || isPending)) {
    return (
      <div className="flex w-full justify-center flex-col items-center h-dvh bg-[url('/bg.png')] bg-cover">
        <div className="flex flex-col items-center justify-center flex-1">
          <Card className="max-w-[36rem] w-full px-10 py-16 gap-4 flex flex-col">
            <b>Are you bored? &#129393;</b>
            <p>We are working hard to get the test details. Please wait a moment.</p>
          </Card>
        </div>
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
      </div>
    );
  }

  // Sınav başlama / bitiş kontrolü
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
        className="absolute flex justify-center items-center h-dvh object-cover"
      />
      <Card className="max-w-[56rem] w-full px-10 pb-16 pt-12 bg-base-white z-10">
        <CardContent className="gap-9 flex flex-col">
          <div className={cn("flex flex-col items-center", !data && "filter blur-sm")}>
            <div className="flex items-center gap-3 my-4 font-bold text-center text-xl">
              <h3
                title={data?.exam.title}
                className="
                  text-brand-primary-950
                  text-center
                  font-semibold
                  mx-auto
                  text-2xl sm:text-xl md:text-2xl lg:text-3xl
                  max-w-[360px] sm:max-w-[480px] md:max-w-[640px] lg:max-w-[720px]
                  overflow-auto
                  break-normal
                  whitespace-normal
                  mb-6
                "
              >
                {data?.exam.title}
              </h3>
            </div>
            <div className="flex items-center text-center max-w-[480px] justify-center gap-2">
              <p>{formatTimeLeft(timer)}</p>
            </div>
          </div>

          <div className={cn("flex flex-col gap-4", !data && "filter blur-sm")}>
            {/* Additional quiz info */}
            <div className="border rounded-2xl border-greyscale-light-200 p-4 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row gap-8 w-full justify-between">
                {/* Type */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-brand-secondary-50 text-brand-secondary-950 rounded-md">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-primary-950">Type</p>
                    <p className="text-base font-medium text-brand-primary-950">Quiz</p>
                  </div>
                </div>
                {/* Total Questions */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-brand-secondary-50 text-brand-secondary-950 rounded-md">
                    <Squares2X2Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-primary-950">Total Questions</p>
                    <p className="text-base font-medium text-brand-primary-950">
                      {data?.exam?.questionCount ?? 0}
                    </p>
                  </div>
                </div>
                {/* Duration */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-brand-secondary-50 text-brand-secondary-950 rounded-md">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-primary-950">Duration</p>
                    <p className="text-base font-medium text-brand-primary-950">
                      <DurationFormatter duration={data?.exam?.duration ?? 120} base="minutes" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              className="
                min-h-[160px]
                rounded-2xl
                bg-base-white
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
                  break-words
                  word-break-all
                "
              >
                <ReactMarkdown
                  className="mdxeditor"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    img: ({ node, ...props }) => (
                      <img {...props} className="max-w-full h-auto" loading="lazy" />
                    ),
                  }}
                >
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
                      toast.remove();
                      toast.success("You are ready to start the exam. Good luck!");
                      router.push(`/app/exams/${data?.exam._id}`);
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

            <p className="mt-4 text-center text-md">
              {session.session?.walletAddress ? (
                <>
                  Your connected wallet address is:{" "}
                  <a
                    href={`https://minascan.io/mainnet/account/${session.session?.walletAddress}`}
                    target="_blank"
                    className="font-bold"
                  >
                    {session.session?.walletAddress &&
                      `${session.session?.walletAddress.slice(
                        0,
                        5
                      )}...${session.session?.walletAddress.slice(-5)}`}
                  </a>
                </>
              ) : (
                <>
                  You must have an MINA wallet account before using it. Not there yet?{" "}
                  <a
                    className="font-bold text-md"
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
