// app/choose-role/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
export default function ChooseRole() {
  const router = useRouter();

  const handleCreateQuiz = () => {
    router.push("/app/create-exam");
  };

  const handleJoinExam = () => {
    router.push("/app/dashboard/joined");
  };

  const handleGoToDashboard = () => {
    router.push("/app/dashboard/created");
  };

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <main className="flex flex-col items-center justify-center min-h-screen bg-transparent p-8">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl font-bold text-center mb-4">
            Choose your{" "}
            <span className="text-brand-primary-800 bg-clip-text font-extrabold bg-gradient-to-r from-brand-primary-700 to-brand-primary-800">
              role
            </span>{" "}
            😉
          </h1>
          <p className="text-gray-600 text-center mb-12 text-lg">
            What will you do with Choz? We will guide you accordingly.
          </p>

          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <div
              onClick={handleCreateQuiz}
              className="w-[320px] h-[280px] bg-white rounded-3xl p-8 cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center items-center text-center border border-greyscale-light-200 hover:border-brand-tertiary-500"
            >
              <div className="mb-6 p-4 bg-brand-tertiary-200 rounded-full transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-brand-tertiary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                I want to create a quiz! 😜
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Design your perfect quiz with our intuitive creation tools.
              </p>
            </div>

            <div
              onClick={handleJoinExam}
              className="w-[320px] h-[280px] bg-white rounded-3xl p-8 cursor-pointer group pointer-events-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center items-center text-center border border-purple-100"
            >
              <div className="mb-6 p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">I want to join quiz! 😎</h2>
              <p className="text-gray-500 leading-relaxed">
                Start your exam journey in just a minute, completely free!
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={handleGoToDashboard}
              className="gap-2 bg-brand-secondary-100 hover:bg-brand-secondary-200 hover:text-brand-primary-950 group transition-transform duration-300 hover:scale-110"
            >
              Jump to dashboard
              <RocketLaunchIcon className="size-6 transition-transform duration-300 group-hover:-translate-y-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
