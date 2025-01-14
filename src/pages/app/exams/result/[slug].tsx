import Image from "next/image";
import { useRouter } from "next/router";
// import { useQuery } from '@tanstack/react-query';
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { sendEmail } from "@/lib/Client/Exam";

// Icons
import DoneImage from "@/images/backgrounds/done.svg";
import Discord from "@/icons/company-logo/discordlogo.svg";
import Telegram from "@/icons/company-logo/telegramlogo.svg";
import X from "@/icons/company-logo/xlogo.svg";
import toast from "react-hot-toast";
import { useState } from "react";
/* import Choz from "@/images/landing/choz.svg";*/
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon, BellIcon } from "@heroicons/react/24/solid";
import BackgroundPattern from "@/images/backgrounds/backgroundpattern.svg";
import { only } from "node:test";

// API
// import { getScore } from '@/lib/Client/Exam';

function ExamResult() {
  const router = useRouter();

  const [mail, setMail] = useState("");
  // const examID: string = router.query.slug as string;

  // const { data, isLoading, isPending, isError } = useQuery({
  //   queryKey: ['exam'],
  //   queryFn: () => getScore(examID),
  //   enabled: !!examID, // Only fetch data when examID is available
  // });

  const mutationOptions: UseMutationOptions<any, any, any, any> = {
    mutationFn: sendEmail,
    // other options like onSuccess, onError, etc.
    onSuccess: () => {
      //console.log(data);
      toast.success("Email sent successfully! Email will arrive once the quiz is finished.");
      router.replace("/app/dashboard/created");
    },
    onError: (error: any) => {
      toast.error("Failed to send email");
      console.log("Error", error);
    },
  };

  const { mutate: handleMail, isPending } = useMutation(mutationOptions);

  return (
    <div className="flex w-full justify-center flex-col items-center h-dvh bg-[url('/bg.png')] bg-cover">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center h-dvh z-0"
      />
      <div className="flex flex-col items-center justify-center flex-1 z-10">
        <Card className="max-w-[36rem] w-full px-10 py-20 gap-4 flex flex-col border-2 border-greyscale-light-100 rounded-2xl bg-base-white">
          <CardContent className="gap-9 flex flex-col">
            <Image className="mx-auto" src={DoneImage} alt="" />
            <div className="flex flex-col gap-4">
              <p className="font-body font-regular text-base-brand-primary-950">
                <p className="text-brand-primary-950 font-bold text-2xl text-center">
                  🥳 Allready done! 🥳
                </p>
                <br />
                Receive your exam result via email.{" "}
                <span className="text-brand-primary-950 font-bold">If you skip this step,</span> you
                can still access your result later using the exam link. Please note that without
                providing an email address, you won&apos;t be able to view your result.
              </p>
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  placeholder="your@email.com"
                  onChange={(e) => setMail(e.target.value)}
                />
                <Button
                  size="icon"
                  onClick={() => {
                    // validate email
                    if (mail === "" || !mail.includes("@") || !mail.includes(".")) {
                      toast.error("Please enter valid email.");
                      return;
                    }

                    handleMail(mail);
                  }}
                >
                  <PaperAirplaneIcon className="size-6" />
                </Button>
              </div>
              <Link
                href="/app/dashboard/created"
                className="text-sm text-brand-primary-700 mx-auto font-bold hover:text-brand-primary-500 hover:bg-brand-primary-50 rounded-full px-2 py-1"
              >
                I want to skip this step.
              </Link>
            </div>
            <div className="w-full mt-8 mx-auto font-body font-regular text-sm text-brand-primary-950 items-center text-center">
              <p>
                📌 <span className="font-bold">Facing any issues?</span>
                <br />
                <span className="w-[10rem] mx-auto">
                  Don&apos;t hesitate to reach out! Connect with us below.
                </span>
              </p>
              <div className="flex justify-center mt-4">
                <div className="flex gap-4">
                  <a href="https://x.com/chozio" target="_blank">
                    <Image height={32} width={32} src={X} alt="X logo" />
                  </a>
                  <a href="https://discord.gg/TkpVyfNqwQ" target="_blank">
                    <Image height={32} width={32} src={Discord} alt="Discord logo" />
                  </a>
                  <a href="https://t.me/chozio" target="_blank">
                    <Image height={32} width={32} src={Telegram} alt="Telegram logo" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExamResult;
