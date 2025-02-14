import { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import { Button } from "@/components/ui/button";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { PincodeInput } from "@/components/ui/pincode-input";
import { getExamByPinCode } from "@/lib/Client/Exam";
import { toast } from "react-hot-toast";

export default function Join() {
  const [pinCode, setPinCode] = useState<string>("");
  const router = useRouter();

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length !== 6) return;
    
    const response = await getExamByPinCode(pinCode)
    .catch((error) => { toast.error(error.response.data.message); return null; });
    
    if (!response) return;
    router.push(`/app/exams/get-started/${response.examId}`);
  };

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <main className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 sm:p-8">
        <div className="max-w-4xl w-full bg-base-white rounded-3xl px-16 py-24 border border-greyscale-light-200">
          
          <h1 className="text-5xl font-bold text-center mb-4">
            Join a quiz
          </h1>

          <h5 className="text-center mb-6">
            Enter the 6-digit pin code to join the quiz
          </h5>
          
          <div className="flex flex-col gap-4">
            <form onSubmit={handleJoinQuiz}>
              <PincodeInput value={pinCode} onChange={setPinCode} />
              <input type="hidden" value={pinCode} />
              <div className="text-sm text-gray-500 text-center mt-2">
                Only uppercase letters (A-Z) and numbers (0-9) allowed
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  type="submit"
                  variant="outline"
                  className="gap-2 bg-brand-secondary-100 
                  hover:bg-brand-secondary-200 
                  hover:text-brand-primary-950 
                  group transition-all duration-300 
                  hover:scale-105 active:scale-100
                  hover:shadow-lg active:shadow-md
                  px-6 py-3 text-lg font-medium
                  rounded-2xl"
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

