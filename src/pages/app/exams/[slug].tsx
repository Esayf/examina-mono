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
  thematicBreakPlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

// Radix Primitives
import * as RadioGroup from "@radix-ui/react-radio-group";

// API
import { getExamQuestions, getExamDetails, submitQuiz, QuestionDocument } from "@/lib/Client/Exam";
import { Button } from "@/components/ui/button";
import { FetchingQuestions } from "@/components/exam/fetching-questions";
import { QuestionFetchingError } from "@/components/exam/question-fetching-error";
import { Question } from "@/components/exam/question";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/ui/spinner";
import { Counter } from "@/components/exam/counter";

function ExamDetails() {
  const router = useRouter();
  const examId: string = router.query.slug as string;
  const mdRef = useRef<any>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [choices, setChoices] = useState<number[]>([]);

  const {
    data: examData,
    isLoading: isloadingData,
    isError: isErrorExam,
  } = useQuery({
    queryKey: ["exam"],
    queryFn: () => getExamDetails(examId),
    enabled: !!examId,
  });

  const {
    data: questions,
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await getExamQuestions(examId),
    enabled: !!examId,
  });

  const currentQuestion =
    questions && ("message" in questions ? undefined : questions[currentQuestionIndex]);

  useEffect(() => {
    if (currentQuestion && mdRef.current) {
      const description = currentQuestion.text || "";
      mdRef.current.setMarkdown(description);
    }
  }, [currentQuestion]);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      if (!examData) return;

      if (!("exam" in examData)) return;

      if (!questions) return;

      if ("message" in questions) return;

      return await submitQuiz(
        examData.exam._id,
        choices,
        questions?.map((el) => el._id)
      );
    },
    onSuccess: () => {
      toast.loading(
        "Your answers have been submitted successfully. Redirecting to the result page.",
        {
          duration: 2000,
        }
      );
      window.location.href = `/app/exams/result/${examId}`;
    },
    onError: (error) => {
      toast.error("An error occured when submitting the answers. Please try again later.");
    },
  });

  useEffect(() => {
    if (questions && examData) {
      // TODO: handle this better
      if ("message" in questions) return;
      if (!("exam" in examData)) return;

      setChoices(new Array(questions.length).fill(0));
    }
  }, [questions, examData]);

  if (isLoadingQuestions || isloadingData) return <FetchingQuestions />;

  if (
    (!isLoadingQuestions && isErrorQuestions) ||
    (!isloadingData && isErrorExam) ||
    (questions && "message" in questions) ||
    (examData && !("exam" in examData))
  )
    return <QuestionFetchingError />;

  return (
    <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 flex-1 overflow-hidden">
      <Card className="mt-7 rounded-none md:rounded-3xl flex-1 flex flex-col">
        <CardHeader>
          <CardHeaderContent>
            <CardTitle>{examData && examData.exam.title}</CardTitle>
            <CardDescription>{examData && examData.exam.description}</CardDescription>
          </CardHeaderContent>
          <div className="flex gap-2">
            {examData && (
              <Counter
                startDate={examData.exam.startDate}
                duration={examData.exam.duration}
                mutate={mutate}
              />
            )}
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (choices.length === 0 || choices.every((el) => el === 0)) {
                  toast.error("Please answer at least one question before submitting.");
                  return;
                }
                mutate();
              }}
            >
              {isPending ? (
                <>
                  <Spinner className="size-6" />
                  Redirecting
                </>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 gap-4 flex flex-col">
          <div className="flex gap-4 justify-between">
            <Button
              pill
              onClick={() => {
                if (!questions) return;

                setCurrentQuestionIndex((prev) => prev - 1);
              }}
              disabled={isPending || currentQuestion?.number === 1}
            >
              <ArrowLeftIcon className="size-6" />
              Prev
            </Button>

            <div className="flex items-center gap-2">
              {questions &&
                !("message" in questions) &&
                questions.map((el, _i) => {
                  const isActive = el.number === currentQuestion?.number;
                  return (
                    <Button
                      key={_i}
                      pill
                      variant={isActive ? "default" : "outline"}
                      size="icon"
                      onClick={() => {
                        setCurrentQuestionIndex(_i);
                      }}
                    >
                      {_i + 1}
                    </Button>
                  );
                })}
            </div>

            <Button
              pill
              onClick={() => {
                // TODO: handle this better
                if (!questions) return;

                setCurrentQuestionIndex((prev) => prev + 1);
              }}
              disabled={isPending || currentQuestion?.number === questions?.length}
            >
              Next <ArrowRightIcon className="size-6" />
            </Button>
          </div>

          <div className="flex-1">
            <div className="border border-gray-200 rounded-lg p-8 mb-10">
              <MDXEditor
                ref={mdRef}
                readOnly
                markdown={currentQuestion ? currentQuestion.text : ""}
                // markdown={
                //   'ASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDGASLKBAKJSDBGKJASDBGAKSJDG'
                // }
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  markdownShortcutPlugin(),
                  imagePlugin(),
                ]}
              />
              {/* <p className={styles.question_describe}>{currentQuestion?.description}</p> */}
              {/* <p className={styles.question_title}>{currentQuestion?.text}</p> */}
            </div>
            <div>
              <RadioGroup.Root
                className="RadioGroupRoot"
                defaultValue="default"
                aria-label="View density"
              >
                {currentQuestion &&
                  currentQuestion.options.map((el, i) => (
                    <Question
                      key={i}
                      index={i}
                      option={el}
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
  );
}

export default ExamDetails;
