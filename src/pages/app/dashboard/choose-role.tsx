// app/choose-role/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BackgroundPattern from "@/images/backgrounds/bg-5.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";

type RoleCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "tertiary";
};

function RoleCard({ title, description, icon, onClick, variant }: RoleCardProps) {
  const colorClasses = {
    primary: {
      hover: "hover:border-brand-primary-500 hover:bg-brand-primary-50",
      icon: "bg-brand-primary-200 text-brand-primary-500",
      shadow: "hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.1)]",
    },
    tertiary: {
      hover: "hover:border-brand-tertiary-500 hover:bg-brand-tertiary-50",
      icon: "bg-brand-tertiary-200 text-brand-tertiary-500",
      shadow: "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]",
    },
  };

  return (
    <div
      onClick={onClick}
      className={`
        w-full 
        sm:w-[320px]
        min-h-[280px]
        bg-brand-secondary-50
        rounded-3xl
        p-8
        cursor-pointer
        group
        ${colorClasses[variant].shadow}
        active:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)]
        transition-all
        duration-300
        hover:-translate-y-2
        flex flex-col
        justify-center
        items-center
        text-center
        border-2
        border-greyscale-light-400
        ${colorClasses[variant].hover}
        active:translate-y-0
      `}
    >
      <div
        className={`
          mb-6
          p-4
          ${colorClasses[variant].icon}
          rounded-full
          transition-all
          duration-300
          group-hover:scale-110
        `}
      >
        {icon}
      </div>

      <h2 className="text-2xl font-semibold mb-3 text-gray-800">{title}</h2>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default function ChooseRole() {
  const router = useRouter();

  const handleCreateQuiz = () => {
    router.push("/app/create-exam");
  };

  const handleJoinExam = () => {
    router.push("/app/join-exam");
  };

  const handleGoToDashboard = () => {
    router.push("/app/dashboard/created");
  };

  return (
    <div className="flex justify-center items-center h-dvh">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />

      <Card className="max-w-[56rem] w-full px-10 pb-16 pt-12 bg-transparent border-none z-10">
        <CardContent className="gap-9 flex flex-col">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Choose your{" "}
              <span className="text-brand-primary-800 bg-clip-text font-extrabold bg-gradient-to-r from-brand-primary-700 to-brand-primary-800">
                role
              </span>{" "}
              😉
            </h1>
            <h5 className="text-sm sm:text-base text-gray-700 mb-6">
              What will you do with Choz? We will guide you accordingly.
            </h5>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-10">
              <RoleCard
                title="I want to create a quiz!"
                description="Design your perfect quiz with our intuitive creation tools."
                onClick={handleCreateQuiz}
                variant="tertiary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
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
                }
              />

              <RoleCard
                title="I want to challenge myself!"
                description="Start your quiz journey in just a minute, completely free!"
                onClick={handleJoinExam}
                variant="primary"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
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
                }
              />
            </div>

            <div className="flex justify-center items-center gap-4 m-5 font-bold">
              <p>OR</p>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={handleGoToDashboard}
                className="
                  gap-2
                  bg-brand-secondary-100
                  hover:bg-brand-secondary-200
                  hover:text-brand-primary-950
                  group
                  transition-all
                  duration-300
                  hover:scale-105
                  active:scale-100
                  hover:shadow-lg
                  active:shadow-md
                  px-6
                  py-3
                  text-lg
                  font-medium
                  rounded-2xl
                "
              >
                Jump to dashboard
                <RocketLaunchIcon className="size-6 transition-transform duration-300 group-hover:-translate-y-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
