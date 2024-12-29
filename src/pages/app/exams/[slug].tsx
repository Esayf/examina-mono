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

function ExamDetails() {
  const router = useRouter();
  const examId = router.query.slug as string | undefined;
  const mdRef = useRef<MDXEditorMethods>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);

  // Exam details query
  const {
    data: examData,
    isLoading: isloadingData,
    isError: isErrorExam,
  } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getExamDetails(examId!),
    enabled: !!examId,
  });

  // Questions query
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
    <div className="flex flex-col">
      <div className="max-w-[76rem] w-full mx-auto flex flex-col">
        <Card className="mt-7 mb-7 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden">
          <CardHeader>
            <CardHeaderContent>
              <CardTitle className="hidden md:block">{examData.exam.title}</CardTitle>
            </CardHeaderContent>
            <div className="flex gap-8">
              {examData && (
                <Counter
                  startDate={examData.exam.startDate}
                  duration={examData.exam.duration}
                  mutate={mutate}
                  onTimeout={() => router.push("/")}
                />
              )}
              <div className="flex gap-2">
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
                    "Finish quiz"
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1 gap-7 flex flex-col bg-base-white">
            <ExamNavigation
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              isPending={isPending}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              currentQuestion={currentQuestion}
            />

            <div className="flex-1 flex gap-6 flex-col overflow-wrap break-words">
              <div className="border border-greyscale-light-300 bg-base-white rounded-3xl p-4 flex-1 overflow-y-auto overflow-wrap break-words min-h-[360px] max-h-[400px] md:min-h-[400px] md:max-h-[1200px]">
                <MDXEditor
                  className="overflow-wrap break-words non-interactive-editor"
                  ref={mdRef}
                  readOnly={true}
                  markdown={currentQuestion?.text || ""}
                  plugins={[
                    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    imagePlugin({ disableImageResize: true }),
                    tablePlugin(),
                    directivesPlugin(),
                    linkPlugin(),
                    codeBlockPlugin(),
                  ]}
                />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExamDetails;
