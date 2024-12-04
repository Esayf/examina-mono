import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";
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

function ExamDetails() {
  const router = useRouter();
  const examId = router.query.slug as string | undefined;
  const mdRef = useRef<MDXEditorMethods>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);

  // Exam details query
  const { data: examData, isLoading: isloadingData, isError: isErrorExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamDetails(examId!),
    enabled: !!examId,
  });

  // Questions query
  const { data: questions, isLoading: isLoadingQuestions, isError: isErrorQuestions } = useQuery({
    queryKey: ["questions", examId],
    queryFn: () => getExamQuestions(examId!),
    enabled: !!examId,
  });

  const currentQuestion =
    questions && !("message" in questions) ? questions[currentQuestionIndex] : undefined;

  useEffect(() => {
    if (currentQuestion && mdRef.current) {
      const description = currentQuestion.text || "";
      mdRef.current.setMarkdown(description);
    }
  }, [currentQuestion]);

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

  useEffect(() => {
    if (questions && !("message" in questions)) {
      setChoices(new Array(questions.length).fill(0));
    }
  }, [questions]);

  if (isLoadingQuestions || isloadingData) return <FetchingQuestions />;
  if (
    isErrorQuestions ||
    isErrorExam ||
    !questions ||
    "message" in questions ||
    !examData ||
    !("exam" in examData)
  )
    return <QuestionFetchingError />;

  return (
    <div className="h-dvh flex flex-col md:px-6">
      <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 flex-1 overflow-hidden">
        <Card className="mt-7 rounded-none md:rounded-3xl flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <CardHeaderContent>
              <CardTitle>{examData.exam.title}</CardTitle>
              <CardDescription>{examData.exam.description}</CardDescription>
            </CardHeaderContent>
            <div className="flex gap-2">
              {examData && (
                <Counter
                  startDate={examData.exam.startDate}
                  duration={examData.exam.duration}
                  mutate={mutate}
                  onTimeout={() => router.push('/')}
                />
              )}
              <Button
                variant="destructive"
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
                    <Spinner className="size-6" />
                    Submitting...
                  </>
                ) : (
                  "Finish Quiz"
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 gap-4 flex flex-col bg-base-white">
            <ExamNavigation
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              isPending={isPending}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              currentQuestion={currentQuestion}
            />

            <div className="flex-1 flex gap-6">
              <div className="border border-greyscale-light-200 bg-base-white rounded-2xl p-4 mb-10 flex-1">
                <MDXEditor
                  ref={mdRef}
                  readOnly
                  markdown={currentQuestion?.text || ""}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                  ]}
                />
              </div>
              <div className="flex-1">
                <RadioGroup.Root
                  className="RadioGroupRoot"
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
    </div>
  );
}

export default ExamDetails;
