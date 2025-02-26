import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Image from "next/image";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import { Button } from "@/components/ui/button";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { PincodeInput } from "@/components/ui/pincode-input";
import { getExamByPinCode } from "@/lib/Client/Exam";
import { toast } from "react-hot-toast";
import DashboardHeader from "./ui/dashboard-header";

export default function PincodePage() {
  const router = useRouter();
  const [pincode, setPincode] = useState<string>("");

  useEffect(() => {
    if (!router.query.pincode) return;
    setPincode((router.query.pincode as string).toUpperCase());
  }, [router.query.pincode]);

  const redirectToExam = async (pincode: string) => {
    const response = await getExamByPinCode(pincode).catch((error) => {
      toast.error(error.response.data.message);
      router.push("/join");
      return null;
    });

    if (!response) return;
    router.push(`/app/exams/get-started/${response.examId}`);
  };

  useEffect(() => {
    if (!router.query.pincode) return;
    if (!pincode) return;
    redirectToExam(pincode);
  }, [pincode]);

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;

    redirectToExam(pincode);
  };

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <DashboardHeader withoutNav={false} withoutTabs={true} />
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <main className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 sm:p-8">
        <div className="max-w-4xl w-full bg-brand-secondary-50 rounded-3xl px-4 sm:px-8 md:px-16 py-12 sm:py-16 md:py-24 border border-greyscale-light-300">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
            🚀 Quiz time! 🚀
          </h1>

          <h5 className="text-center mb-4 sm:mb-6">
            Enter the 6-digit code for an exciting quiz adventure!
          </h5>

          <div className="flex flex-col gap-4">
            <form onSubmit={handleJoinQuiz}>
              <PincodeInput value={pincode} onChange={setPincode} />
              <input type="hidden" value={pincode} />
              <div className="text-sm text-gray-500 text-center mt-2">
                Only uppercase letters (A-Z) and numbers (0-9) allowed
              </div>
              <div className="mt-6 sm:mt-8 flex justify-center">
                <Button
                  type="submit"
                  variant="outline"
                  className="gap-2 bg-brand-secondary-100 
                  hover:bg-brand-secondary-200 
                  hover:text-brand-primary-950 
                  group transition-all duration-300 
                  hover:scale-105 active:scale-100
                  hover:shadow-lg active:shadow-md
                  px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-medium
                  rounded-xl sm:rounded-2xl"
                >
                  Join quiz
                  <RocketLaunchIcon className="size-6 transition-transform duration-300 group-hover:-translate-y-1" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
