"use client";

import React, { useState } from "react";
import { useStep1Form } from "./step1-schema"; // <-- Form context (title, questions vb. içerir)
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// SHADCN UI Card bileşenleri
import { Card, CardHeader, CardHeaderContent, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useStep2Form } from "./step2-schema";
import Image from "next/image";
import BG from "@/images/backgrounds/BG3.svg";

/** Basit bir ProgressBar bileşeni */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className="bg-brand-primary-950 h-2.5 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
export function LiveExamPreview() {
  // 1. Adım form
  const step1Form = useStep1Form();
  const questions = step1Form.watch("questions") || [];
  const totalQuestions = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex] || null;
  const questionNumber = currentIndex + 1;

  // 2. Adım form
  const step2Form = useStep2Form();
  const titleValue = step2Form.watch("title") || "Untitled Exam";

  // Soru gezinme fonksiyonları
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Navigation butonlarına tıklayınca direkt i. soruya atlama
  const handleJumpToQuestion = (i: number) => {
    setCurrentIndex(i);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 overflow-auto rounded-3xl">
      {totalQuestions === 0 ? (
        <p className="text-gray-600 mt-4">
          No questions added yet. Add some questions to see the preview here.
        </p>
      ) : (
        <div className="flex gap-4">
          <Card className="bg-base-white w-full rounded-3xl md:rounded-3xl flex flex-col">
            {/* Üst Kısım: Başlık + Progress Bar */}
            <CardHeader>
              <CardHeaderContent className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <div className="flex flex-col gap-2">
                  <CardTitle>{titleValue}</CardTitle>
                  <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-1">
                    <ProgressBar current={questionNumber} total={totalQuestions} />
                    <span className="text-xs text-gray-600">
                      Question {questionNumber} / {totalQuestions}
                    </span>
                  </div>
                </div>
              </CardHeaderContent>
            </CardHeader>

            {/* 2) Exam Navigation - Sorulara Doğrudan Atla */}
            <div className="flex justify-center flex-wrap gap-2 mt-2">
              {questions.map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentIndex ? "default" : "outline"}
                  onClick={() => handleJumpToQuestion(i)}
                  className="w-[52px] h-[52px] text-lg"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            {/* Soru İçeriği + Navigasyon */}
            <CardContent className="p-5 flex flex-col gap-6 bg-base-white rounded-b-3xl mb-4 overflow-auto">
              {currentQuestion && (
                <>
                  <div
                    className="
                      border border-greyscale-light-200
                      bg-white
                      rounded-2xl
                      p-4
                      shadow-sm
                      flex flex-col
                      gap-4
                    "
                  >
                    {/* Soru Metni (Markdown) */}
                    <div className="text-base text-gray-800 min-h-[120px] max-h-[120px] overflow-auto break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentQuestion.question || ""}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {currentQuestion.answers?.map((ans, idx) => {
                      const isCorrect =
                        currentQuestion.correctAnswer === ans.answer ||
                        currentQuestion.correctAnswer === idx.toString();

                      return (
                        <div
                          key={idx}
                          className={`
                            px-3 py-3 
                            rounded-2xl
                            border
                            flex items-center
                            transition-colors 
                            duration-200
                            ${
                              isCorrect
                                ? "bg-green-50 border-green-300 text-green-900"
                                : "bg-gray-50 border-gray-200 text-gray-700"
                            }
                          `}
                        >
                          <span className="break-words">{ans.answer || "Untitled option"}</span>
                          {isCorrect && (
                            <span className="ml-2 text-green-700 font-medium text-sm">
                              (Correct)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 1) Previous / Next Butonları */}
              <div className="flex flex-row items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentIndex <= 0}
                  onClick={handleBack}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentIndex >= totalQuestions - 1}
                  onClick={handleNext}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
