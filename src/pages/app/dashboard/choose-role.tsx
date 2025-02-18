// app/choose-role/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";

// Daha zengin bir emoji listesi
const EMOJI_OPTIONS = ["😎", "😜", "🤓", "👩‍💻", "🤩", "🤔", "🦸‍♂️", "🧙‍♂️", "👨‍🏫", "👩‍🎓"];

// Role kartları için ayrı bir bileşen oluşturalım
type RoleCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "tertiary";
  emoji: string;
};

function RoleCard({ title, description, icon, onClick, variant, emoji }: RoleCardProps) {
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
      className={`w-[320px] h-[280px] bg-brand-secondary-50 rounded-3xl p-8 cursor-pointer group 
      ${colorClasses[variant].shadow}
      active:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] 
      transition-all duration-300 hover:-translate-y-2 
      flex flex-col justify-center items-center text-center 
      border-2 border-greyscale-light-400 
      ${colorClasses[variant].hover}
      active:translate-y-0`}
    >
      <div
        className={`mb-6 p-4 ${colorClasses[variant].icon} rounded-full transition-all duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>
      <h2 className="text-2xl font-semibold mb-3 text-gray-800">
        {title} {emoji}
      </h2>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default function ChooseRole() {
  const router = useRouter();

  // EKLENDI: Seçilen emojiyi local state ile tutalım
  const [chosenEmoji, setChosenEmoji] = useState<string>("😎");

  const handleCreateQuiz = () => {
    router.push("/app/create-exam");
  };

  const handleJoinExam = () => {
    router.push("/app/dashboard/joined");
  };

  const handleGoToDashboard = () => {
    router.push("/app/dashboard/created");
  };

  // EKLENDI: Emoji seçimini buradan yönetiyoruz
  const handleEmojiSelect = (emoji: string) => {
    setChosenEmoji(emoji);
  };

  return (
    <div className="relative min-h-screen h-dvh flex flex-col z-0 overflow-y-auto">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <main className="flex flex-col items-center justify-center min-h-screen bg-transparent p-8">
        <div className="max-w-4xl w-full bg-base-white rounded-3xl px-16 py-24 border border-greyscale-light-200">
          <h1 className="text-5xl font-bold text-center mb-4">
            Choose your{" "}
            <span className="text-brand-primary-800 bg-clip-text font-extrabold bg-gradient-to-r from-brand-primary-700 to-brand-primary-800">
              role
            </span>{" "}
            😉
          </h1>
          <h5 className="text-center mb-6">
            What will you do with Choz? We will guide you accordingly.
          </h5>

          {/* EKLENDI: Emoji Seçici */}
          <div className="mt-6 mb-2">
            <p className="text-center font-semibold text-lg mb-3">
              #Choz an emoji to represent you:
            </p>
            <div className="flex flex-wrap gap-3 justify-center items-center my-4">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-2xl hover:scale-110 transition-transform 
                    border border-greyscale-light-300 rounded-full 
                    px-3 py-2 bg-white 
                    hover:shadow-md hover:border-brand-primary-500 
                    active:scale-105"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-center mt-3 text-brand-primary-800 text-xl font-semibold">
              Selected Emoji: <span className="text-3xl">{chosenEmoji}</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center mt-10">
            <RoleCard
              title="I'm quiz creator!"
              description="Design your perfect quiz with our intuitive creation tools."
              onClick={handleCreateQuiz}
              variant="tertiary"
              emoji={chosenEmoji}
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
              title="I am joiner!"
              description="Start your exam journey in just a minute, completely free!"
              onClick={handleJoinExam}
              variant="primary"
              emoji={chosenEmoji}
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
              className="gap-2 bg-brand-secondary-100 
              hover:bg-brand-secondary-200 
              hover:text-brand-primary-950 
              group transition-all duration-300 
              hover:scale-105 active:scale-100
              hover:shadow-lg active:shadow-md
              px-6 py-3 text-lg font-medium
              rounded-2xl"
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
