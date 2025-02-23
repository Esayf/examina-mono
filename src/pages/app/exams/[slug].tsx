import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  MDXEditor,
  MDXEditorMethods,
  imagePlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  directivesPlugin,
  codeBlockPlugin,
  linkPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

// API
import { getExamQuestions, getExamDetails, submitQuiz } from "@/lib/Client/Exam";

// Bileşenler
import BackgroundPattern from "@/images/backgrounds/bg-7.svg";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardHeaderContent, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmFinishModal } from "@/components/ui/confirm-finish-modal";
import { ExamNavigation } from "@/components/live-exam/exam-navigation";
import { Counter, Counter as TimeCounter } from "@/components/live-exam/counter";
import { Question } from "@/components/live-exam/question";
import { FetchingQuestions } from "@/components/live-exam/fetching-questions";
import { QuestionFetchingError } from "@/components/live-exam/question-fetching-error";

// Markdown render
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// ------------------ Özel Hook'lar ------------------ //

// Exam detaylarını çeken hook
function useExamDetails(examId?: string) {
  return useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamDetails(examId!),
    enabled: !!examId,
  });
}

// Exam sorularını çeken hook
function useExamQuestions(examId?: string) {
  return useQuery({
    queryKey: ["questions", examId],
    queryFn: () => getExamQuestions(examId!),
    enabled: !!examId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

// Sınav cevaplarını gönderen hook
function useSubmitQuiz({ onSuccess, onError }: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation({
    mutationFn: async ({
      examId,
      choices,
      questionIds,
    }: {
      examId: string;
      choices: number[];
      questionIds: string[];
    }) => submitQuiz(examId, choices, questionIds),
    onSuccess,
    onError,
  });
}

// ------------------ Yardımcı Bileşenler ------------------ //

/** ProgressBar bileşeni */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const remainingQuestions = total - current;

  return (
    <div className="w-full">
      <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 transition-all duration-500 bg-gradient-to-r from-brand-primary-300 to-brand-primary-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>{current} answered</span>
        <span>{remainingQuestions} remaining</span>
      </div>
    </div>
  );
}

/** Soru Metnini (Markdown) gösteren bileşen */
function QuestionDetail({ content }: { content: string }) {
  return (
    <div className="border border-greyscale-light-200 bg-base-white w-full rounded-3xl p-8 md:p-12 flex-1 overflow-y-auto items-center justify-center">
      <div className="mdxeditor prose min-w-full min-h-[calc(100dvh-600px)]">
        <ReactMarkdown
          className="mdxeditor prose max-w-[580px]
            [&_h1]:text-4xl [&_h1]:text-center [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:bg-brand-primary-900 [&_h1]:from-brand-primary-950 [&_h1]:to-brand-primary-900 
            [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h1]:drop-shadow-md
            [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:text-brand-primary-600 [&_h2]:pl-4
            [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:text-brand-primary-800
            [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-brand-primary-950
            [&_h5]:text-lg [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:text-brand-primary-950
            [&_h6]:text-base [&_h6]:font-normal [&_h6]:mb-0 [&_h6]:text-brand-primary-950
            [&_p]:text-xl [&_p]:font-normal [&_p]:text-brand-primary-950
            [&_a]:text-brand-secondary-950 [&_a]:font-medium [&_a]:hover:text-brand-secondary-900
            [&_code]:text-base [&_code]:font-mono [&_code]:bg-brand-primary-300 [&_code]:text-base-black 
            [&_code]:font-bold [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-lg
            [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:space-y-3 [&_ul]:text-lg [&_ul]:text-brand-primary-950 
            [&_li::marker]:text-brand-primary-500 
            [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:space-y-3 [&_ol]:text-lg [&_ol]:text-brand-primary-950 
            [&_ol]:marker:font-bold 
            [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary-300 [&_blockquote]:bg-brand-secondary-50 
            [&_blockquote]:p-2 [&_blockquote]:w-full [&_blockquote]:text-brand-primary-950 [&_blockquote]:m-2 
            [&_blockquote]:italic [&_blockquote]:bg-white [&_blockquote]:rounded-xl [&_blockquote]:shadow-sm 
            [&_blockquote]:justify-center [&_blockquote]:items-center [&_blockquote]:text-center
            [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:shadow-lg 
            [&_img]:border-4 [&_img]:border-white
            [&_hr]:my-8 [&_hr]:border-t-4 [&_hr]:border-dashed [&_hr]:border-brand-primary/30"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
        >
          {content || ""}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/** Masaüstü görünümdeki navigasyon ve "Finish quiz" butonu */
function DesktopHeader({
  examTitle,
  answeredCount,
  total,
  onFinish,
  isPending,
  examStartDate,
  examDuration,
}: {
  examTitle: string;
  answeredCount: number;
  total: number;
  onFinish: () => void;
  isPending: boolean;
  examStartDate: string;
  examDuration: number;
}) {
  return (
    <CardHeader>
      <CardHeaderContent className="flex flex-col lg:flex-row gap-4 md:gap-0 justify-between items-start">
        <div className="flex flex-col w-full md:max-w-[70%] gap-2">
          <CardTitle className="text-xl md:text-2xl">{examTitle}</CardTitle>
          <div className="flex flex-col w-full gap-2">
            <ProgressBar current={answeredCount} total={total} />
          </div>
        </div>

        {/* Sayaç ve Finish butonu (yalnızca md üzeri) */}
        <div className="hidden md:flex items-center gap-3">
          <Counter
            startDate={examStartDate}
            duration={examDuration}
            onTimeout={() => {
              toast.error("Time is up!");
              onFinish();
            }}
            classname="max-w-[120px] max-h-[52px]"
            mutate={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <Button
            variant="default"
            className="transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 flex items-center"
            icon
            iconPosition="right"
            disabled={isPending}
            onClick={onFinish}
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
  );
}

/** Masaüstü alt navigasyon (Prev/Next) */
function DesktopBottomNavigation({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  questions,
  choices,
  isPending,
}: {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  questions: any[];
  choices: number[];
  isPending: boolean;
}) {
  return (
    <div className="hidden md:flex w-full fixed bottom-0 left-0 right-0 z-50 bg-white/60 border-t p-4 items-center justify-between">
      {/* Previous */}
      <Button
        variant="tertiary"
        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
        disabled={isPending || currentQuestionIndex === 0}
        className="flex items-center gap-2 px-6 py-3 text-lg"
      >
        <ArrowLeftIcon className="size-5" />
        Previous
      </Button>

      {/* Next */}
      <Button
        variant="tertiary"
        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
        disabled={isPending || currentQuestionIndex === questions.length - 1}
        className="flex items-center gap-2 px-6 py-3 text-lg"
      >
        Next
        <ArrowRightIcon className="size-5" />
      </Button>
    </div>
  );
}
/** Mobil alt kısım navigasyonu ve Finish butonu */
function MobileStickyNavigation({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  totalQuestions,
  onFinish,
  isPending,
  questions,
  choices,
}: {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  totalQuestions: number;
  onFinish: () => void;
  isPending: boolean;
  questions: any[]; // Aslında tip: Question[]
  choices: number[];
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-2 flex items-center justify-between gap-2 min-w-screen px-4">
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

      <div className="flex flex-row overflow-x-auto">
        <ExamNavigation
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          isPending={isPending}
          currentQuestionIndex={currentQuestionIndex}
          questions={questions}
          currentQuestion={questions[currentQuestionIndex]}
          choices={choices}
        />
      </div>

      <Button
        pill
        variant="outline"
        size="icon"
        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
        disabled={isPending || currentQuestionIndex === totalQuestions - 1}
        className="flex-shrink-0"
      >
        <ArrowRightIcon className="size-6" />
      </Button>

      <Button
        variant="default"
        className="flex-shrink-0 ml-2 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 flex items-center"
        icon
        iconPosition="right"
        disabled={isPending}
        onClick={onFinish}
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
  );
}

/**
 * LiveQuiz Bileşeni
 */
export default function LiveQuiz() {
  const router = useRouter();
  const examId = router.query.slug as string | undefined;
  const mdRef = useRef<MDXEditorMethods>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sınav Detayları
  const { data: examData, isLoading: isLoadingExam, isError: isErrorExam } = useExamDetails(examId);

  // Sorular
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
  } = useExamQuestions(examId);
  // Sınavı gönderme (submit) işlemi
  const { mutate: submit, isPending } = useSubmitQuiz({
    onSuccess: () => {
      toast.success("Your answers have been submitted. Redirecting...");
      router.push(`/app/exams/result/${examId}`);
    },
    onError: () => {
      toast.error("An error occurred. Please try again.");
    },
  });

  // Güncel soru
  const currentQuestion =
    questions && !("message" in questions) ? questions[currentQuestionIndex] : undefined;

  // Sorular yüklendiğinde choices array'ini başlat
  useEffect(() => {
    if (questions && !("message" in questions)) {
      setChoices(new Array(questions.length).fill(0));
    }
  }, [questions]);

  // Markdown metnini her soru değişiminde düzenle
  useEffect(() => {
    if (currentQuestion && mdRef.current) {
      mdRef.current.setMarkdown(currentQuestion.text || "");
    }
  }, [currentQuestion]);

  // Yükleme & Hata durumları
  if (isLoadingExam || isLoadingQuestions) return <FetchingQuestions />;
  if (
    isErrorExam ||
    isErrorQuestions ||
    !questions ||
    "message" in questions ||
    !examData ||
    !("exam" in examData)
  ) {
    return <QuestionFetchingError />;
  }

  // Finish quiz tıklandığında (kullanıcı onayından önce)
  const handleFinishClick = () => {
    // Eğer kullanıcı hiçbir soruyu cevaplamamışsa
    if (choices.every((choice) => choice === 0)) {
      toast.error("Please answer at least one question.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Onay verdikten sonra submit işlemi
  const handleSubmit = () => {
    if (!examData || !questions || "message" in questions || !("exam" in examData)) {
      toast.error("Missing exam data. Please try again.");
      return;
    }

    submit({
      examId: examData.exam._id,
      choices,
      questionIds: questions.map((q) => q._id),
    });
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
        <div className="flex flex-col gap-4">
          {/* Quiz Card */}
          <Card className="mt-1 mb-1 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden h-full">
            {/* Masaüstü header (progress, sayaç, finish) */}
            <DesktopHeader
              examTitle={examData.exam.title}
              answeredCount={choices.filter((c) => c !== 0).length}
              total={questions.length}
              onFinish={handleFinishClick}
              isPending={isPending}
              examStartDate={examData.exam.startDate}
              examDuration={examData.exam.duration}
            />

            <CardContent className="p-3 md:p-6 flex flex-col gap-10 bg-base-white h-full">
              {/* Navigation (Sadece MD ve üzeri) */}
              <div className="hidden md:flex gap-4 justify-between w-full overflow-x-auto">
                <ExamNavigation
                  className="text-2xl"
                  setCurrentQuestionIndex={setCurrentQuestionIndex}
                  isPending={isPending}
                  currentQuestionIndex={currentQuestionIndex}
                  questions={questions}
                  currentQuestion={currentQuestion}
                  choices={choices}
                />
              </div>

              {/* Soru Metni ve Seçenekler */}
              <div className="flex flex-col xl:flex-row gap-4">
                {/* Soru Metni */}

                <QuestionDetail content={currentQuestion?.text || ""} />

                {/* Seçenekler */}
                <div className="flex-1">
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
                      {currentQuestion?.options?.map(
                        (option: { number: number; text: string }, index: number) => (
                          <Question
                            key={index}
                            index={index}
                            option={option}
                            choices={choices}
                            currentQuestion={currentQuestion}
                            setChoices={setChoices}
                          />
                        )
                      )}
                    </RadioGroup.Root>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* "Önceki" ve "Sonraki" butonlarının masaüstünde alt tarafta sabit görünmesi istenirse
              buraya ekleyebilirsiniz. Şu an mobilde sticky bar olarak görünüyor. */}
        </div>

        {/* Mobil Sticky Navigation (bottom) */}
        <MobileStickyNavigation
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          totalQuestions={questions.length}
          onFinish={handleFinishClick}
          isPending={isPending}
          questions={questions}
          choices={choices}
        />
      </div>

      {/* Masaüstü alt navigasyon (Prev/Next) - Card'ın dışında, sayfa altına sabit */}
      <DesktopBottomNavigation
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        questions={questions}
        choices={choices}
        isPending={isPending}
      />

      {/* Sınavı bitirme onayı (Modal) */}
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
              handleSubmit();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
