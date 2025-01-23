"use client";

import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

import { sendEmail } from "@/lib/Client/Exam";
import DoneImage from "@/images/backgrounds/done.svg";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import Discord from "@/icons/company-logo/discordlogo.svg";
import Telegram from "@/icons/company-logo/telegramlogo.svg";
import X from "@/icons/company-logo/xlogo.svg";
import SocialLinks from "@/components/landing-page/social-links";

// Regex ile basit e-posta doğrulama
function isValidEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

function ExamResult() {
  const router = useRouter();
  const [mail, setMail] = useState("");

  const mutationOptions: UseMutationOptions<any, any, any, any> = {
    mutationFn: sendEmail,
    onSuccess: () => {
      toast.success("Email sent successfully! Email will arrive once the quiz is finished.");
      router.replace("/app/dashboard/created");
    },
    onError: (error: any) => {
      toast.error("Failed to send email");
      console.log("Error", error);
    },
  };

  const { mutate: handleMail } = useMutation(mutationOptions);

  return (
    <div className="flex justify-center items-center h-dvh">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center h-dvh object-cover"
      />
      <div className="flex flex-col items-center justify-center flex-1 z-10">
        <Card className="max-w-[36rem] w-full px-10 py-20 gap-4 flex flex-col border-2 border-greyscale-light-200 rounded-2xl bg-base-white mx-2">
          <CardContent className="gap-9 flex flex-col">
            <Image className="mx-auto" src={DoneImage} alt="" />
            <div className="flex flex-col gap-4">
              <p className="font-body font-regular text-base-brand-primary-950">
                <p className="text-brand-primary-950 font-bold text-2xl text-center mb-6">
                  🥳 Already done! 🥳
                </p>
                <p>
                  We’ll email your result once the quiz time ends. If you skip this, no worries—you
                  can still get it using your quiz link later. 💜
                </p>
              </p>
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  aria-label="Your email"
                  className="h-13"
                  placeholder="you@mail.com"
                  onChange={(e) => setMail(e.target.value)}
                />
                <Button
                  size="icon"
                  className="h-13 w-13"
                  onClick={() => {
                    if (!isValidEmail(mail)) {
                      toast.error("Please enter a valid email address.");
                      return;
                    }
                    // Kullanıcıya onay soralım:
                    const userConfirmed = confirm(
                      `Can you confirm your email address, please?"\n${mail}`
                    );
                    if (!userConfirmed) {
                      return;
                    }
                    handleMail(mail);
                  }}
                >
                  <PaperAirplaneIcon className="size-5" />
                </Button>
              </div>
              <Link
                href="/app/dashboard/created"
                className="text-sm text-brand-primary-900 mx-auto font-bold hover:text-brand-primary-700 rounded-full px-2 py-1 underline"
              >
                skip this step
              </Link>
            </div>
            <div className="w-full mt-8 mx-auto gap-3 font-body font-regular text-sm text-brand-primary-950 items-center text-center">
              <div className="mt-6 text-center">
                <p className="text-sm text-brand-primary-950 mb-2 font-semibold">
                  Facing any issues?
                </p>
                <p className="text-sm text-brand-primary-800 mb-4">
                  Reach out to us on any of these platforms:
                </p>
                <SocialLinks />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExamResult;
