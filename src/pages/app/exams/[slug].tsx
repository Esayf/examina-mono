import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

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
import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Counter } from "@/components/live-exam/counter";
import { ExamNavigation } from "@/components/live-exam/exam-navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  return (
    <div className="flex justify-center items-center h-dvh">
      <Image
        src={BackgroundPattern}
        alt="Background pattern"
        className="absolute flex justify-center items-center min-h-screen object-cover"
      />
      <div className="max-w-[76rem] md:min-h-[900px] md:max-h-[900px] w-full mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
        <Card className="mt-7 mb-7 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden">
          <CardHeader>
            {/* CardHeader’de sadece exam title ve description (mobilde) */}
            <CardHeaderContent className="flex flex-row overflow-auto justify-between">
              <div className="flex flex-col overflow-hidden gap-3">
                <CardTitle className="hidden md:block">{examData.exam.title}</CardTitle>
                <div className="flex flex-col w-full md:w-auto gap-2">
                  <ProgressBar current={currentIndex} total={questions.length} />
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Question {currentIndex} / {questions.length}
                  </span>
                </div>
              </div>
              {/* Finish Quiz Butonu */}
              <div className="flex justify-end md:justify-start gap-2">
                {/* Sayaç (Counter) */}
                {examData && (
                  <Counter
                    startDate={examData.exam.startDate}
                    duration={examData.exam.duration}
                    mutate={mutate}
                    onTimeout={() => router.push("/")}
                    beepOnLastMinute
                    quizId={""}
                  />
                )}

                <Button
                  variant="default"
                  className="transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 flex items-center z-50 mr-1"
                  icon={true}
                  iconPosition={"right"}
                  disabled={isPending}
                  onClick={() => {
                    if (choices.every((choice) => choice === 0)) {
                      toast.error("Please answer at least one question.");
                      return;
                    }
                    mutate();
                  }}
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
            </CardHeaderContent>
          </CardHeader>

          {/* CardContent içinde, progress bar ve butonlar için ayrı bir satır... */}
          <CardContent className="p-5 flex flex-col gap-6 bg-base-white overflow-auto md:min-h-[646px]">
            {/* Üst kısım: ProgressBar, Soru X/Y, Sayaç (Counter) ve "Finish quiz" butonu */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full"></div>
            <div className="flex gap-4 justify-between">
              <Button
                pill
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentQuestionIndex((prev) => prev - 1);
                }}
                disabled={isPending || currentQuestionIndex === 0}
              >
                <ArrowLeftIcon className="size-6" />
              </Button>
              {/* Navigasyon + Sorunun kendisi */}
              <ExamNavigation
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                isPending={isPending}
                currentQuestionIndex={currentQuestionIndex}
                questions={questions}
                currentQuestion={currentQuestion}
              />
              <Button
                pill
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentQuestionIndex((prev) => prev + 1);
                }}
                disabled={isPending || currentQuestionIndex === questions.length - 1}
              >
                <ArrowRightIcon className="size-6" />
              </Button>
            </div>
            <div className="flex-1 flex gap-6 flex-col overflow-wrap break-words">
              <div className="border border-greyscale-light-200 bg-base-white rounded-3xl p-4 flex-1 overflow-y-auto overflow-wrap break-words min-h-[240px] max-h-[260px] text-xl md:min-h-[240px] md:max-h-[300px]">
                <ReactMarkdown
                  className="prose w-full break-words overflow-wrap"
                  remarkPlugins={[remarkGfm]}
                >
                  {currentQuestion?.text || ""}
                </ReactMarkdown>
              </div>

              <div className="flex-1">
                <RadioGroup.Root
                  className="RadioGroupRoot overflow-wrap break-words"
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
            <div className="flex gap-4 justify-between">
              <Button
                pill
                variant="outline"
                onClick={() => {
                  setCurrentQuestionIndex((prev) => prev - 1);
                }}
                disabled={isPending || currentQuestionIndex === 0}
              >
                <ArrowLeftIcon className="size-6 hidden md:block mr-2" />
                Previous
              </Button>
              <Button
                pill
                variant="outline"
                onClick={() => {
                  setCurrentQuestionIndex((prev) => prev + 1);
                }}
                disabled={isPending || currentQuestionIndex === questions.length - 1}
              >
                Next
                <ArrowRightIcon className="size-6 hidden md:block ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LiveQuiz;
