import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getExamDetails, startExam } from "@/lib/Client/Exam";

import { authenticate } from "../../../../hooks/auth";

// Icons
import Choz from "@/icons/choz.svg";
import { isMobile } from "react-device-detect";
import toast from "react-hot-toast";
import { setSession } from "@/features/client/session";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { humanize } from "@/utils/formatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

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

  const canStartExam = data?.exam?.startDate && new Date(data?.exam?.startDate) < new Date();

  return (
    <div className="flex justify-center items-center h-dvh bg-[url('/bg.png')] bg-cover">
      <Card className="max-w-[36rem] w-full px-10 py-16">
        <CardContent className="gap-9 flex flex-col">
          <div className={cn("flex flex-col items-center", !data && "filter blur-sm")}>
            <p className="text-sm font-medium">
              <b>{data?.exam.creator}</b> invited you to join
            </p>
            <div className="flex items-center gap-5 my-4">
              <GlobeAltIcon className="size-8" />
              <h3 title={data?.exam.title}>
                {data?.exam.title && data?.exam.title?.length > 25
                  ? `${data?.exam.title.substring(0, 25)}...`
                  : data?.exam.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4" />
              <p>{data && humanize(new Date(data.exam.startDate))}</p>
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
                    .catch(() => {
                      toast.remove();
                      toast.error("Failed to start exam!");
                    });
                }}
              >
                Start Exam
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
                Connect Wallet
              </Button>
            )}

            <p className="mt-4">
              {session.session?.walletAddress ? (
                <>
                  You are using this wallet address:{" "}
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
