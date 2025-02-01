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

// Radix Primitives
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

// Dialog (Modal) Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmFinishModal } from "@/components/ui/confirm-finish-modal";

/**
 * ProgressBar bileşeni
 */
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

function LiveQuiz() {
  const router = useRouter();
  const examId = router.query.slug as string | undefined;
  const mdRef = useRef<MDXEditorMethods>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // NEW: Control modal

  // 1) Exam details query
  const {
    data: examData,
    isLoading: isloadingData,
    isError: isErrorExam,
  } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamDetails(examId!),
    enabled: !!examId,
  });

  // 2) Questions query
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
  } = useQuery({
    queryKey: ["questions", examId],
    queryFn: () => getExamQuestions(examId!),
    enabled: !!examId,
  });

  // O anki soru
  const currentQuestion =
    questions && !("message" in questions) ? questions[currentQuestionIndex] : undefined;

  // Soru açıklamasını (Markdown) editor'e setlemek
  useEffect(() => {
    if (currentQuestion && mdRef.current) {
      const description = currentQuestion.text || "";
      mdRef.current.setMarkdown(description);
    }
  }, [currentQuestion]);

  // Quiz submit
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

  // Sorular yüklendikten sonra "choices" array'ini sıfırlıyoruz
  useEffect(() => {
    if (questions && !("message" in questions)) {
      setChoices(new Array(questions.length).fill(0));
    }
  }, [questions]);

  // Loading & Error durumları
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

  // Şu an kaçıncı sorudayız (1-index)
  const currentIndex = currentQuestionIndex + 1;

  // Handle finish quiz button click
  const handleFinishClick = () => {
    // Check if the user has selected at least one answer
    if (choices.every((choice) => choice === 0)) {
      toast.error("Please answer at least one question.");
      return;
    }
    // Open confirm modal
    setShowConfirmModal(true);
  };

  return (
    <div className="flex justify-center items-center max-h-full">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center min-h-screen object-cover"
      />
      <div className="w-full max-w-[90rem] px-4 py-4 sm:px-6 lg:px-4 flex flex-col gap-6">
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

              <div className="flex justify-end">
                {/* Finish Quiz Butonu */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="default"
                    className="transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 flex items-center z-50 mr-1"
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
                </div>
                <div className="flex justify-end">
                  <div className="flex gap-2">
                    {/* Sayaç (Counter) */}
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
                </div>
              </div>
            </CardHeaderContent>
          </CardHeader>

          {/* CardContent içinde, progress bar ve butonlar için ayrı bir satır... */}
          <CardContent className="p-3 md:p-6 flex flex-col gap-4 bg-base-white overflow-auto h-full">
            <div className="flex gap-4 justify-between w-full">
              {/* Navigation buttons */}
              <div className="flex gap-4 w-full justify-between">
                <Button
                  pill
                  variant="default"
                  size="icon"
                  className="w-full md:w-auto"
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  disabled={isPending || currentQuestionIndex === 0}
                >
                  <ArrowLeftIcon className="size-6 mr-2" />
                </Button>

                {/* Geri eklenen ExamNavigation bileşeni */}
                <ExamNavigation
                  setCurrentQuestionIndex={setCurrentQuestionIndex}
                  isPending={isPending}
                  currentQuestionIndex={currentQuestionIndex}
                  questions={questions}
                  currentQuestion={currentQuestion}
                />

                <Button
                  pill
                  variant="default"
                  size="icon"
                  className="w-full md:w-auto"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={isPending || currentQuestionIndex === questions.length - 1}
                >
                  <ArrowRightIcon className="size-6 ml-2" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex gap-4 flex-col overflow-wrap break-words h-[calc(100dvh-600px)]">
              <div className="border border-greyscale-light-200 bg-base-white rounded-3xl p-2 md:p-4 flex-1 overflow-y-auto">
                <ReactMarkdown
                  className="prose max-w-none w-full p-2 md:p-4 break-words"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    img: ({ node, ...props }) => (
                      <img {...props} className="max-w-full h-auto" loading="lazy" />
                    ),
                  }}
                >
                  {currentQuestion?.text || ""}
                </ReactMarkdown>
              </div>
              {/* Quiz Description (Markdown) */}
              <div className="flex-1">
                <RadioGroup.Root
                  className="RadioGroupRoot overflow-wrap whitespace-pre-wrap break-words"
                  defaultValue="default"
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
          </CardContent>
        </Card>
      </div>

      {/* Confirm Finish Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-[95vw] rounded-2xl">
          <ConfirmFinishModal
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
