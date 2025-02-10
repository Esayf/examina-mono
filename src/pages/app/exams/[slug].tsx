import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { useMutation, useQuery } from "@tanstack/react-query";
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  imagePlugin,
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditorMethods,
  directivesPlugin,
  codeBlockPlugin,
  linkPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import * as RadioGroup from "@radix-ui/react-radio-group";

// API
import { getExamQuestions, getExamDetails, submitQuiz } from "@/lib/Client/Exam";
import { Button } from "@/components/ui/button";
import { FetchingQuestions } from "@/components/live-exam/fetching-questions";
import { QuestionFetchingError } from "@/components/live-exam/question-fetching-error";
import { Question } from "@/components/live-exam/question";
import { Card, CardContent, CardHeader, CardHeaderContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Counter } from "@/components/live-exam/counter";
import { ExamNavigation } from "@/components/live-exam/exam-navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmFinishModal } from "@/components/ui/confirm-finish-modal";
import { Label } from "@radix-ui/react-label";

/** ProgressBar bileşeni */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-2.5 transition-all duration-500 bg-gradient-to-r from-brand-primary-300 to-brand-primary-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function LiveQuiz() {
  const router = useRouter();
  const examId = router.query.slug as string | undefined;
  const mdRef = useRef<MDXEditorMethods>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 1) Exam details
  const {
    data: examData,
    isLoading: isloadingData,
    isError: isErrorExam,
  } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamDetails(examId!),
    enabled: !!examId,
  });

  // 2) Questions
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
  } = useQuery({
    queryKey: ["questions", examId],
    queryFn: () => getExamQuestions(examId!),
    enabled: !!examId,
  });

  const currentQuestion =
    questions && !("message" in questions) ? questions[currentQuestionIndex] : undefined;

  useEffect(() => {
    if (currentQuestion && mdRef.current) {
      mdRef.current.setMarkdown(currentQuestion.text || "");
    }
  }, [currentQuestion]);

  // Submit quiz
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!examData || !questions || "message" in questions || !("exam" in examData)) {
        toast.error("Missing exam data. Please try again.");
        return;
      }
      return submitQuiz(
        examData.exam._id,
        choices,
        questions.map((q) => q._id)
      );
    },
    onSuccess: () => {
      toast.success("Your answers have been submitted. Redirecting...");
      router.push(`/app/exams/result/${examId}`);
    },
    onError: () => {
      toast.error("An error occurred. Please try again.");
    },
  });

  // Initialize choices array
  useEffect(() => {
    if (questions && !("message" in questions)) {
      setChoices(new Array(questions.length).fill(0));
    }
  }, [questions]);

  // Loading & Error
  if (isLoadingQuestions || isloadingData) return <FetchingQuestions />;
  if (
    isErrorQuestions ||
    isErrorExam ||
    !questions ||
    "message" in questions ||
    !examData ||
    !("exam" in examData)
  ) {
    return <QuestionFetchingError />;
  }

  const currentIndex = currentQuestionIndex + 1;

  const handleFinishClick = () => {
    // Check if at least one answer is selected
    if (choices.every((choice) => choice === 0)) {
      toast.error("Please answer at least one question.");
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <div className="flex justify-center items-center max-h-full">
      {/* Arka plan */}
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0"
      />

      <div className="w-full max-w-[90rem] min-h-full px-4 py-4 sm:px-6 lg:px-4 flex flex-col gap-6 relative">
        <Card className="mt-1 mb-1 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden h-full">
          <CardHeader>
            <CardHeaderContent className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start">
              <div className="flex flex-col w-full md:max-w-[70%] gap-2">
                <CardTitle className="text-xl md:text-2xl">{examData.exam.title}</CardTitle>
                <div className="flex flex-col w-full gap-2">
                  <ProgressBar
                    current={choices.filter((c) => c !== 0).length}
                    total={questions.length}
                  />
                  <span className="text-sm text-gray-700">
                    Answered {choices.filter((c) => c !== 0).length} / {questions.length}
                  </span>
                </div>
              </div>

              {/* ÜSTTEKİ Finish ve Sayaç sadece MD ve üzeri ekranlarda (masaüstü/tablet) gözüksün */}
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="default"
                  className="transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 flex items-center"
                  icon={true}
                  iconPosition={"right"}
                  disabled={isPending}
                  onClick={handleFinishClick}
                >
                  {isPending ? (
                    <>
                      <Spinner className="size-6 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Finish quiz"
                  )}
                  <ArrowUpRightIcon className="size-6 ml-1 hidden md:block" />
                </Button>

                {examData && (
                  <Counter
                    startDate={examData.exam.startDate}
                    duration={examData.exam.duration}
                    mutate={mutate}
                    onTimeout={() => router.push("/")}
                    classname="max-w-[120px] max-h-[52px]"
                  />
                )}
              </div>
            </CardHeaderContent>
          </CardHeader>

          <CardContent className="p-3 md:p-6 flex flex-col gap-10 bg-base-white overflow-auto h-full">
            {/* Navigation buttons (Sadece MD ve üzeri) */}
            <div className="hidden md:flex gap-4 justify-between w-full">
              <Button
                pill
                variant="outline"
                size="icon"
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                disabled={isPending || currentQuestionIndex === 0}
              >
                <ArrowLeftIcon className="size-6" />
              </Button>

              <ExamNavigation
                className="text-2xl transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95"
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                isPending={isPending}
                currentQuestionIndex={currentQuestionIndex}
                questions={questions}
                currentQuestion={currentQuestion}
                choices={choices}
              />

              <Button
                pill
                variant="outline"
                size="icon"
                className="transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={isPending || currentQuestionIndex === questions.length - 1}
              >
                <ArrowRightIcon className="size-6" />
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2 flex-col overflow-wrap break-words h-[calc(100dvh-30rem)] md:h-[calc(100dvh-19rem)]">
                {/* Soru Metni */}
                <div className="border border-greyscale-light-200 bg-base-white rounded-3xl p-8 md:p-16 flex-1 overflow-y-auto items-center justify-center">
                  <div className="mdxeditor prose min-w-full min-h-[calc(100dvh-600px)]">
                    <ReactMarkdown
                      className="mdxeditor prose min-w-full
                    [&_h1]:text-4xl [&_h1]:text-center [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:bg-brand-primary-900 [&_h1]:from-brand-primary-950 [&_h1]:to-brand-primary-900 [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:drop-shadow-md
                    [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-brand-primary-600 [&_h2]:pl-4
                    [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:text-brand-primary-800
                    [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-brand-primary-950
                    [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:text-brand-primary-950
                    [&_h6]:text-base [&_h6]:font-normal [&_h6]:mb-0 [&_h6]:text-brand-primary-950
                    [&_p]:text-xl [&_p]:font-normal [&_p]:text-brand-primary-950
                    [&_a]:text-brand-secondary-950 [&_a]:font-medium [&_a]:hover:text-brand-secondary-900
                    [&_code]:text-base [&_code]:font-mono [&_code]:bg-brand-primary-300 [&_code]:text-base-black [&_code]:font-bold [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-lg
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
                      {currentQuestion?.text || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {/* Seçenekler */}
                <div className="flex-1 min-h-[calc(100dvh-480px)]">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-medium">Your answer</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newChoices = [...choices];
                        newChoices[currentQuestionIndex] = 0;
                        setChoices(newChoices);
                      }}
                      className="text-sm text-brand-primary-950 hover:text-brand-primary-600"
                    >
                      Clear answer
                    </Button>
                  </div>
                  <RadioGroup.Root
                    className="RadioGroupRoot overflow-wrap whitespace-pre-wrap break-words"
                    aria-label="Answer options"
                  >
                    {currentQuestion?.options?.map((option, index) => (
                      <Question
                        key={index}
                        index={index}
                        option={option}
                        choices={choices}
                        currentQuestion={currentQuestion}
                        setChoices={setChoices}
                      />
                    ))}
                  </RadioGroup.Root>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- ALTTAKİ STICKY BAR (sadece mobilde görünsün) --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-2 flex items-center justify-between gap-2 min-w-screen whitespace-nowrap px-4">
          <Button
            pill
            variant="outline"
            size="icon"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={isPending || currentQuestionIndex === 0}
            className="flex-shrink-0"
          >
            <ArrowLeftIcon className="size-6" />
          </Button>

          <div className="flex flex-grow overflow-x-auto whitespace-nowrap">
            <ExamNavigation
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              isPending={isPending}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              currentQuestion={currentQuestion}
              choices={choices}
            />
          </div>

          <Button
            pill
            variant="outline"
            size="icon"
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={isPending || currentQuestionIndex === questions.length - 1}
            className="flex-shrink-0"
          >
            <ArrowRightIcon className="size-6" />
          </Button>

          <Button
            variant="default"
            className="flex-shrink-0 ml-2 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 flex items-center"
            icon={true}
            iconPosition={"right"}
            disabled={isPending}
            onClick={handleFinishClick}
          >
            {isPending ? (
              <>
                <Spinner className="size-6 mr-2" />
                Submitting...
              </>
            ) : (
              "Finish"
            )}
            <ArrowUpRightIcon className="size-6 ml-1" />
          </Button>
        </div>
      </div>

      {/* Confirm Finish Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-[95vw] rounded-2xl">
          <ConfirmFinishModal
            title="Finish quiz"
            message="Are you sure you want to finish the quiz?"
            confirmText="Yes, I'm done!"
            cancelText="No."
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={() => {
              setShowConfirmModal(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LiveQuiz;
