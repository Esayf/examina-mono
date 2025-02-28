"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  LightBulbIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { JoinedExamResponse } from "@/lib/Client/Exam";
import { motion, AnimatePresence } from "framer-motion";

interface AnswerKeyModalProps {
  open: boolean;
  onClose: () => void;
  exam: JoinedExamResponse | null;
}

export function AnswerKeyModal({ open, onClose, exam: examProp }: AnswerKeyModalProps) {
  const exam = examProp;
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions = exam?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Add score calculation
  const correctAnswers = questions.filter(
    (q) => q.userAnswer !== null && Number(q.userAnswer) === Number(q.correctAnswer)
  ).length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

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

  const getOptionClassName = (option: { number: number; text: string }, currentQuestion: any) => {
    const isCorrect = Number(currentQuestion.correctAnswer) === Number(option.number);
    const isUserAnswer = Number(currentQuestion.userAnswer) === Number(option.number);
    const wasUnanswered = currentQuestion.userAnswer === null;

    if (isCorrect && isUserAnswer) {
      return "bg-green-100 border-2 border-green-500 text-green-900 shadow-sm"; // Correct answer - stronger green
    } else if (isCorrect) {
      return "bg-green-50 border-2 border-green-500 text-green-900"; // Show correct answer - green border
    } else if (isUserAnswer) {
      return "bg-red-100 border-2 border-red-500 text-red-900 shadow-sm"; // Wrong answer - stronger red
    } else if (wasUnanswered && isCorrect) {
      return "bg-amber-100 border-2 border-amber-500 text-amber-900"; // Highlight correct when unanswered - yellow
    }
    return "bg-gray-50 border-gray-200 text-gray-700"; // Default state
  };

  const getAnswerStatus = (option: { number: number; text: string }, currentQuestion: any) => {
    const isCorrect = Number(currentQuestion.correctAnswer) === Number(option.number);
    const isUserAnswer = Number(currentQuestion.userAnswer) === Number(option.number);
    const wasUnanswered = currentQuestion.userAnswer === null;

    if (isCorrect && isUserAnswer) {
      return (
        <span className="flex items-center text-green-700 font-medium">
          <CheckIcon className="w-5 h-5 mr-1" />
          Correct Answer
        </span>
      );
    } else if (isCorrect && wasUnanswered) {
      return (
        <span className="flex items-center text-amber-700 font-medium">
          <CheckIcon className="w-5 h-5 mr-1" />
          Correct Answer (unanswered)
        </span>
      );
    } else if (isCorrect) {
      return (
        <span className="flex items-center text-green-700 font-medium">
          <CheckIcon className="w-5 h-5 mr-1" />
          Correct Answer
        </span>
      );
    } else if (isUserAnswer) {
      return (
        <span className="flex items-center text-red-700 font-medium">
          <XMarkIcon className="w-5 h-5 mr-1" />
          Your Answer
        </span>
      );
    }
    return null;
  };

  if (!exam || !currentQuestion) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[76rem] h-[90vh] p-6 bg-gradient-to-b from-brand-secondary-50 to-brand-secondary-100 w-full overflow-hidden flex flex-col rounded-3xl border-t-4 border-t-brand-primary-500">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-brand-primary-100 pb-4 bg-gradient-to-r from-brand-primary-50 to-brand-primary-100/50 rounded-xl px-6 -mx-2 shadow-sm">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-primary-950 to-brand-primary-700 bg-clip-text text-transparent flex items-center">
              <AcademicCapIcon className="inline-block w-8 h-8 mr-3 mb-1 text-brand-primary-600 bg-white p-1.5 rounded-full shadow-sm border border-brand-primary-200" />
              <div>
                {exam.title}
                <span className="text-sm text-brand-primary-600 block mt-1 font-normal">
                  Answer Key
                </span>
              </div>
            </DialogTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center px-4 py-2 bg-white rounded-full shadow-sm border border-brand-primary-200 gap-2">
              <TrophyIcon className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-brand-primary-600">Score:</span>
              <span
                className={`text-lg font-bold ${
                  score >= 70 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {score}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 w-10 p-2 border-brand-primary-950 bg-brand-secondary-100 hover:bg-brand-primary-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-2">
          {/* Status Banner with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={`
                mb-4 p-4 rounded-xl text-sm font-medium
                shadow-sm border flex items-center
                ${
                  currentQuestion.userAnswer === null
                    ? "bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 border-amber-200"
                    : Number(currentQuestion.userAnswer) === Number(currentQuestion.correctAnswer)
                    ? "bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 border-green-200"
                    : "bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 border-red-200"
                }
              `}
            >
              {currentQuestion.userAnswer === null ? (
                <>
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  You didn't answer this question
                </>
              ) : Number(currentQuestion.userAnswer) === Number(currentQuestion.correctAnswer) ? (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  You answered this question correctly!
                </>
              ) : (
                <>
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Your answer was incorrect
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Question Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-greyscale-light-200 min-h-[10rem]"
            >
              <div className="flex items-center justify-between mb-4 min-h-[400px] p-5 border border-greyscale-light-200 rounded-3xl">
                <ReactMarkdown
                  className="mdxeditor prose max-w-full w-full sm:w-[524px]
                [&_blockquote]:animate-[fadeIn_0.5s_ease-in-out]
                [&_p]:hover:translate-x-1 [&_p]:transition-transform
                [&_li]:hover:pl-4 [&_li]:transition-all
                [&_img]:hover:scale-[1.02] [&_img]:transition-transform
                [&_strong]:animate-[pulse_2s_infinite]
                [&_code]:hover:scale-[1.05]
                [&_h1]:text-xl [&_h1]:sm:text-4xl [&_h1]:text-center [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:bg-brand-primary-900 [&_h1]:from-brand-primary-950 [&_h1]:to-brand-primary-900 [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:drop-shadow-md
                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-brand-primary-600 [&_h2]:pl-4
                [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:text-brand-primary-800
                [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-brand-primary-950
                [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:text-brand-primary-950
                [&_h6]:text-base [&_h6]:font-normal [&_h6]:mb-0 [&_h6]:text-brand-primary-950
                [&_p]:text-base [&_p]:font-normal [&_p]:text-brand-primary-950
                [&_a]:text-brand-secondary-950 [&_a]:font-medium [&_a]:hover:text-brand-secondary-900
                [&_code]:text-base [&_code]:bg-brand-primary-300 [&_code]:text-base-black [&_code]:font-bold [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-lg
                [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:space-y-3 [&_ul]:text-lg [&_ul]:text-brand-primary-950 [&_ul]:items-center [&_ul]:justify-center
                [&_li::marker]:text-brand-primary-500 [&_li::marker]:text-base [&_li::marker]:text-center [&_li::marker]:font-bold [&_ul_li::marker]:content-['🔘']
                [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:space-y-3 [&_ol]:text-lg [&_ol]:text-brand-primary-950 [&_ol]:items-center [&_ol]:justify-center
                [&_ol]:marker:font-bold  [&_ol]:marker:brand-primary-800 [&_ol]:marker:text-lg [&_ol]:font-normal 
                [&_li]:pl-3 [&_li]:space-x-2
                [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary-300 [&_blockquote]:bg-brand-secondary-50 [&_blockquote]:p-2 [&_blockquote]:w-full [&_blockquote]:text-brand-primary-950 [&_blockquote]:m-2 [&_blockquote]:italic [&_blockquote]:bg-white [&_blockquote]:rounded-xl [&_blockquote]:shadow-sm [&_blockquote]:justify-center [&_blockquote]:items-center [&_blockquote]:text-center
                [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:shadow-lg [&_img]:border-4 [&_img]:border-white
                [&_hr]:my-8 [&_hr]:border-t-4 [&_hr]:border-dashed [&_hr]:border-brand-primary/30"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {currentQuestion.text}
                </ReactMarkdown>
              </div>

              {/* Options */}
              <div className="mt-6 space-y-4">
                {currentQuestion.options.map((option) => (
                  <motion.div
                    key={option.number}
                    whileHover={{ scale: 1.01 }}
                    className={`
                    group p-4 rounded-3xl border transition-all duration-200
                    hover:shadow-md cursor-pointer
                    ${getOptionClassName(option, currentQuestion)}
                  `}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={`
                        w-6 h-6 flex items-center justify-center rounded-full border
                        transition-all duration-200 shadow-sm
                        ${
                          option.number === currentQuestion.correctAnswer
                            ? "bg-green-50 border-green-500 text-green-700"
                            : option.number === currentQuestion.userAnswer
                            ? "bg-red-50 border-red-500 text-red-700"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }
                      `}
                      >
                        <div
                          className={`w-3 h-3 rounded-full transition-transform duration-200 
                          ${
                            option.number === Number(currentQuestion.userAnswer)
                              ? "bg-current scale-100"
                              : "bg-transparent scale-0"
                          }`}
                        ></div>
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAnswerStatus(option, currentQuestion)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Explanation Area - New Section 
              {currentQuestion.correctAnswer && (
                <div className="mt-8 p-4 bg-gradient-to-br from-brand-primary-50 to-brand-primary-100 rounded-xl border border-brand-primary-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 text-brand-primary-800">
                    <LightBulbIcon className="w-6 h-6 flex-shrink-0 text-amber-600" />
                    <h3 className="font-bold text-lg">Detailed Explanation</h3>
                  </div>
                  <div className="prose prose-brand-primary max-w-none">
                    <p className="text-brand-primary-700 italic">
                      No explanation available for this question.
                    </p>
                  </div>
                </div>
              )}*/}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky Bottom Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-brand-primary-100 py-4 px-6 -mx-6 -mb-6 mt-10 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              variant="outline"
              className="rounded-full bg-transparent hover:bg-brand-secondary-100 flex items-center gap-2 flex-1 sm:flex-none"
              disabled={currentIndex <= 0}
              onClick={handleBack}
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-2 order-last sm:order-none w-full sm:w-auto justify-center mt-2 sm:mt-0">
              {questions.map((_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="icon"
                  onClick={() => handleJumpToQuestion(i)}
                  className={`w-11 h-11 rounded-full text-sm transition-all ${
                    currentIndex === i
                      ? "bg-brand-primary-900 text-brand-secondary-300"
                      : "bg-transparent text-brand-primary-700 hover:bg-brand-secondary-100"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              className="rounded-full hover:bg-brand-primary-50 flex items-center gap-2 flex-1 sm:flex-none"
              disabled={currentIndex >= totalQuestions - 1}
              onClick={handleNext}
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
