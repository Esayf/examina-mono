import Image from "next/image";
import { useRouter } from "next/router";
// import { useQuery } from '@tanstack/react-query';
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { sendEmail } from "@/lib/Client/Exam";

// Icons
import ResultImage from "@/images/exam/result.svg";
import Discord from "@/icons/discord.svg";
import Telegram from "@/icons/telegram.svg";
import Twitter from "@/icons/twitter.svg";
import toast from "react-hot-toast";
import { useState } from "react";
/* import Choz from "@/images/landing/choz.svg";*/
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon, BellIcon } from "@heroicons/react/24/solid";

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
      toast.success("Email sent successfully");
      router.replace("/app");
    },
    onError: (error: any) => {
      toast.error("Failed to send email");
      console.log("Error", error);
    },
  };

  const { mutate: handleMail, isPending } = useMutation(mutationOptions);

  return (
    <div className="flex w-full justify-center flex-col items-center h-dvh bg-[url('/bg.png')] bg-cover">
      <div className="flex flex-col items-center justify-center flex-1">
        <Card className="max-w-[36rem] w-full px-10 py-16 gap-4 flex flex-col">
          <CardContent className="gap-9 flex flex-col">
            <Image className="mx-auto" src={ResultImage} alt="" />
            <div className="flex flex-col gap-4">
              <p className="font-medium">
                Get your exam result to your email account. If you skip this step, you can still get
                your result from the quiz link. It will redirect you to the result page. If you dont
                write your email, you can not get your result.
              </p>
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  placeholder="john@doe.com"
                  onChange={(e) => setMail(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // validate email
                    if (mail === "" || !mail.includes("@") || !mail.includes(".")) {
                      toast.error("Please enter valid email");
                      return;
                    }

                    handleMail(mail);
                  }}
                >
                  <PaperAirplaneIcon className="size-6" />
                </Button>
              </div>
              <Link href="/app" className="text-primary block mx-auto font-bold hover:underline">
                Skip and Continue
              </Link>
            </div>
            <div className="flex gap-4">
              <BellAlertIcon className="size-14 text-primary" />
              <p>
                If you encounter any issues, don&apos;t forget to reach out by following us!
                We&apos;ll contact you from there.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex gap-4">
                <a href="https://twitter.com/chozapp" target="_blank">
                  <Image src={Twitter} alt="" />
                </a>
                <a href="https://discord.gg/TkpVyfNqwQ" target="_blank">
                  <Image src={Discord} alt="" />
                </a>
                <a href="https://t.me/chozio" target="_blank">
                  <Image src={Telegram} alt="" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExamResult;
