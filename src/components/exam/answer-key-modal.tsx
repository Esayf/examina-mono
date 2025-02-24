"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { JoinedExamResponse } from "@/lib/Client/Exam";

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

  // For debugging
  console.log("Exam data:", exam);
  console.log("Current question:", currentQuestion);

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
    const isCorrect = currentQuestion.correctAnswer === option.number;
    const isUserAnswer = currentQuestion.userAnswer === option.number;
    const wasUnanswered = currentQuestion.userAnswer === null;

    if (isCorrect && isUserAnswer) {
      return "bg-green-50 border-green-500 text-green-900 shadow-sm"; // Correct answer
    } else if (isCorrect) {
      return "bg-green-50/50 border-green-500/50 text-green-900 border-dashed"; // Show correct answer
    } else if (isUserAnswer) {
      return "bg-red-50 border-red-500 text-red-900 shadow-sm"; // Wrong answer
    } else if (wasUnanswered && isCorrect) {
      return "bg-amber-50 border-amber-500 text-amber-900 border-dashed"; // Highlight correct when unanswered
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
          Correct Answer (Not Answered)
        </span>
      );
    } else if (isCorrect) {
      return (
        <span className="flex items-center text-green-700/75 font-medium">
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
      <DialogContent className="max-w-[76rem] h-[90vh] p-6 bg-gradient-to-br from-white to-brand-secondary-50/30 w-full overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-brand-primary-100 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-brand-primary-950 to-brand-primary-700 bg-clip-text text-transparent">
              Answer Key - {exam.title}
            </DialogTitle>
            <p className="text-sm text-brand-primary-600">
              Review your answers and see the correct solutions
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-brand-primary-200 hover:bg-brand-primary-50"
          >
            Close
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6">
          {/* Status Banner with animation */}
          {currentQuestion && (
            <div
              className={`
              mb-4 p-4 rounded-xl text-sm font-medium
              shadow-sm border
              motion-safe:animate-fadeIn
              ${
                currentQuestion.userAnswer === null
                  ? "bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 border-amber-200"
                  : Number(currentQuestion.userAnswer) === Number(currentQuestion.correctAnswer)
                  ? "bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 border-green-200"
                  : "bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 border-red-200"
              }
            `}
            >
              {currentQuestion.userAnswer === null
                ? "You didn't answer this question"
                : Number(currentQuestion.userAnswer) === Number(currentQuestion.correctAnswer)
                ? "You answered this question correctly!"
                : "Your answer was incorrect"}
            </div>
          )}

          {/* Progress and Navigation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-primary-100 space-y-4">
            <div className="flex justify-between items-center text-sm text-brand-primary-600">
              <span>Progress</span>
              <span>
                {currentIndex + 1} of {totalQuestions}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-brand-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary-600 to-brand-primary-400 
                  transition-all duration-500 ease-in-out"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question Navigation */}
            <div className="flex items-center gap-3 justify-between pt-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentIndex <= 0}
                onClick={handleBack}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((q, i) => (
                  <Button
                    key={i}
                    variant={i === currentIndex ? "default" : "outline"}
                    onClick={() => handleJumpToQuestion(i)}
                    className={`w-[52px] h-[52px] text-lg ${
                      q.userAnswer === q.correctAnswer
                        ? "border-green-500 text-green-700"
                        : q.userAnswer === null
                        ? "border-gray-300 text-gray-700"
                        : "border-red-500 text-red-700"
                    }`}
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
          </div>

          {/* Question Content */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-primary-100 w-full overflow-y-auto">
            <ReactMarkdown
              className="mdxeditor prose max-w-full
                [&_h1]:text-4xl [&_h1]:text-center [&_h1]:font-bold [&_h1]:mb-6 
                [&_h1]:bg-gradient-to-r [&_h1]:from-brand-primary-950 [&_h1]:to-brand-primary-700 
                [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:drop-shadow-md
                [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary-300 
                [&_blockquote]:bg-brand-secondary-50 [&_blockquote]:p-4 [&_blockquote]:rounded-xl
                [&_code]:bg-brand-primary-900 [&_code]:text-white [&_code]:p-2 [&_code]:rounded-lg"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {currentQuestion.text}
            </ReactMarkdown>

            {/* Options */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.number}
                  className={`
                    group p-4 rounded-xl border transition-all duration-200
                    hover:shadow-md hover:scale-[1.01]
                    ${getOptionClassName(option, currentQuestion)}
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className={`
                      w-8 h-8 flex items-center justify-center rounded-full
                      ${
                        option.number === currentQuestion.correctAnswer
                          ? "bg-green-100 text-green-700"
                          : option.number === currentQuestion.userAnswer
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                    >
                      {option.number}
                    </span>
                    <span className="flex-1">{option.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAnswerStatus(option, currentQuestion)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
