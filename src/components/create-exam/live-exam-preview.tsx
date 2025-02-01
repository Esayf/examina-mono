"use client";

import React, { useState } from "react";
import { useStep1Form } from "./step1-schema";
import { useStep2Form } from "./step2-schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card, CardHeader, CardHeaderContent, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
/** Basit ProgressBar */
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

interface LiveExamPreviewProps {
  onGoBack: () => void; // Geri tuşu için callback
}

export function LiveExamPreview({ onGoBack }: LiveExamPreviewProps) {
  // Sorular
  const step1Form = useStep1Form();
  const questions = step1Form.watch("questions") || [];
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex] || null;
  const questionNumber = currentIndex + 1;

  // Başlık
  const step2Form = useStep2Form();
  const titleValue = step2Form.watch("title") || "Untitled Exam";

  // Navigasyon
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
  const handleJumpToQuestion = (i: number) => {
    setCurrentIndex(i);
  };

  return (
    <div className="w-full max-w-[76rem] mx-auto px-0 sm:px-6 lg:px-8 flex flex-col gap-6">
      <Card className="mt-4 mb-4 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden">
        {/* Üst Header: Go Back + Title + Progress + Finish */}
        <CardHeader>
          <CardHeaderContent className="flex flex-row items-center justify-between gap-4">
            {/* Title & progress */}
            <div className="flex flex-col items-start gap-2 flex-1 px-6">
              <CardTitle className="hidden md:block">{titleValue}</CardTitle>
              <div className="flex flex-col w-full gap-1">
                <ProgressBar current={questionNumber} total={totalQuestions} />
                <span className="text-sm text-gray-700">
                  Question {questionNumber} / {totalQuestions}
                </span>
              </div>
            </div>

            {/* Finish quiz butonu (örnek) */}
            <Button variant="default" onClick={() => alert("Finish quiz!")}>
              Finish quiz
            </Button>
          </CardHeaderContent>
        </CardHeader>

        {/* Soru İçeriği & Navigasyon */}
        <CardContent className="p-5 flex flex-col gap-6 bg-base-white overflow-auto">
          {/* Previous / Next + "doğrudan atla" */}
          <div className="flex flex-row items-center gap-3 justify-between">
            <Button variant="outline" size="icon" disabled={currentIndex <= 0} onClick={handleBack}>
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex flex-wrap gap-2">
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
            <Button
              variant="outline"
              size="icon"
              disabled={currentIndex >= totalQuestions - 1}
              onClick={handleNext}
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Soru + Cevaplar */}
          {currentQuestion && (
            <div className="bg-white rounded-2xl flex flex-col gap-4">
              {/* Soru Metni */}
              <div className="border border-greyscale-light-200 bg-base-white rounded-3xl p-4 min-h-[240px] max-h-[320px] overflow-y-auto text-base">
                <ReactMarkdown
                  className="prose w-full max-w-none 
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:border-b [&_h1]:pb-2
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3
                    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2
                    [&_h4]:text-lg [&_h4]:font-medium [&_h4]:mb-2
                    [&_h5]:text-base [&_h5]:font-medium
                    [&_h6]:text-sm [&_h6]:font-medium
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
                    [&_li]:pl-2 [&_li]:my-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:italic
                    [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-4 [&_img]:mx-auto [&_img]:block
                    [&_hr]:my-6 [&_hr]:border-gray-200"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a className="text-blue-600 hover:underline font-medium" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <table className="divide-y divide-gray-300 w-full my-4" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="py-2 px-4 text-left bg-gray-50 font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="py-2 px-4 border-t border-gray-200" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm"
                        {...props}
                      />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre
                        className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-4"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                  }}
                >
                  {currentQuestion.question || ""}
                </ReactMarkdown>
              </div>

              {/* Cevaplar */}
              <div className="flex flex-col gap-2">
                {currentQuestion.answers?.map((ans, idx) => {
                  const isCorrect =
                    currentQuestion.correctAnswer === ans.answer ||
                    currentQuestion.correctAnswer === idx.toString();
                  return (
                    <div
                      key={idx}
                      className={`
                        px-6 py-3 
                        rounded-2xl
                        border
                        flex items-center
                        transition-colors
                        duration-200
                        min-h-[80px]
                        ${
                          isCorrect
                            ? "bg-green-50 border-green-300 text-green-900"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }
                      `}
                    >
                      <span className="break-words">{ans.answer || "Untitled option"}</span>
                      {isCorrect && (
                        <span className="ml-2 text-green-700 font-medium text-sm">(Correct)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
