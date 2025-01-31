// app/choose-role/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ChooseRole() {
  const router = useRouter();

  const handleCreateQuiz = () => {
    router.push("/app/dashboard/created");
  };

  const handleJoinExam = () => {
    router.push("/app/dashboard/joined");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-4">
        Choose your <span className="text-purple-600">role</span>
      </h1>
      <p className="text-gray-600 text-center mb-8">
        What will you do with Choz? We will guide you accordingly.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sol Kart */}
        <div
          onClick={handleCreateQuiz}
          className="w-[300px] h-[250px] border border-gray-400 rounded-xl p-6 cursor-pointer hover:shadow-xl transition-shadow flex flex-col justify-center items-center text-center"
        >
          <h2 className="text-xl font-semibold mb-2">I want to create quiz</h2>
          <p className="text-gray-500">
            Navigate to the exam creation page and fill in your questions and answers.
          </p>
        </div>

        {/* Sağ Kart */}
        <div
          onClick={handleJoinExam}
          className="w-[300px] h-[250px] border border-gray-400 rounded-xl p-6 cursor-pointer hover:shadow-xl transition-shadow flex flex-col justify-center items-center text-center"
        >
          <h2 className="text-xl font-semibold mb-2">I want to join exam</h2>
          <p className="text-gray-500">
            Enjoy the freedom – register your exam in just a minute, absolutely free!
          </p>
        </div>
      </div>
    </main>
  );
}
