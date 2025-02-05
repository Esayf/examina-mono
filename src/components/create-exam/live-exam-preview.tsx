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
                  className=" mdxeditor prose min-w-full
                    [&_h1]:text-4xl [&_h1]:text-center [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:bg-brand-primary-900 [&_h1]:from-brand-primary-950 [&_h1]:to-brand-primary-900 [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:drop-shadow-md
                    [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-brand-primary-600 [&_h2]:pl-4
                    [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:text-brand-primary-800
                    [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-brand-primary-950
                    [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:text-brand-primary-950
                    [&_h6]:text-base [&_h6]:font-normal [&_h6]:mb-0 [&_h6]:text-brand-primary-950
                    [&_p]:text-base [&_p]:font-normal [&_p]:text-brand-primary-950
                    [&_a]:text-brand-secondary-950 [&_a]:font-medium [&_a]:hover:text-brand-secondary-900
                    [&_code]:text-base [&_code]:bg-brand-primary-300 [&_code]:text-base-black [&_code]:font-bold [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-lg
                    [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:space-y-3 [&_ul]:text-lg [&_ul]:text-brand-primary-950 [&_ul]:items-center [&_ul]:justify-center
                    [&_li::marker]:text-brand-primary-500 [&_li::marker]:text-base [&_li::marker]:text-center [&_li::marker]:font-bold [&_ul_li::marker]:content-['🟣']
                    [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:space-y-3 [&_ol]:text-lg [&_ol]:text-brand-primary-950 [&_ol]:items-center [&_ol]:justify-center
                    [&_ol]:marker:font-bold  [&_ol]:marker:brand-primary-800 [&_ol]:marker:text-lg [&_ol]:font-normal 
                    [&_li]:pl-3 [&_li]:space-x-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary-300 [&_blockquote]:bg-brand-secondary-50 [&_blockquote]:p-2 [&_blockquote]:w-full [&_blockquote]:text-brand-primary-950 [&_blockquote]:m-2 [&_blockquote]:italic [&_blockquote]:bg-white [&_blockquote]:rounded-xl [&_blockquote]:shadow-sm [&_blockquote]:justify-center [&_blockquote]:items-center [&_blockquote]:text-center
                    [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:shadow-lg [&_img]:border-4 [&_img]:border-white
                    [&_hr]:my-8 [&_hr]:border-t-4 [&_hr]:border-dashed [&_hr]:border-brand-primary/30"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        className="text-brand-secondary font-medium hover:text-brand-accent transition-all 
                          underline underline-offset-4 decoration-2 hover:decoration-brand-accent
                          hover:scale-105 inline-block"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="rounded-2xl shadow-lg overflow-hidden my-6 border border-brand-primary-900">
                        <table className="w-full divide-y divide-brand-primary-200" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="py-3 px-4 text-left bg-brand-primary-400 font-bold text-base-black text-base uppercase"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="py-3 px-4 border-t text-base text-base-black border-greyscale-light-200 text-brand-dark even:bg-brand-light/20"
                        {...props}
                      />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        className="bg-brand-accent/10 px-2 py-1 rounded-md font-mono text-sm text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/20 transition-colors"
                        {...props}
                      />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre
                        className="bg-brand-dark p-6 rounded-xl overflow-x-auto text-sm my-6 text-white 
                          shadow-2xl border-2 border-brand-primary/30 hover:border-brand-accent/50 transition-all"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-black text-brand-accent drop-shadow-sm" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-brand-primary/90 font-semibold" {...props} />
                    ),
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
