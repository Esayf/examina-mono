import { Form, useFieldArray } from "react-hook-form";
import { useStep2Form } from "./step2-schema";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown";
import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeftCircleIcon,
  PaperAirplaneIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { QuestionListItem } from "./question-list-item";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { createExam } from "@/lib/Client/Exam";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useStep1Form } from "./step1-schema";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnswersProps {
  index: number;
}

const Answers = ({ index }: AnswersProps) => {
  const { control, watch } = useStep2Form();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `questions.${index}.answers`,
  });

  const questionType = watch(`questions.${index}.questionType`);

  const prevQuestionType = useRef(questionType);

  useEffect(() => {
    if (questionType === prevQuestionType.current) return;

    if (questionType === "tf") replace([{ answer: "True" }, { answer: "False" }]);

    if (questionType === "mc") replace([{ answer: "" }, { answer: "" }]);

    prevQuestionType.current = questionType;
  }, [questionType, replace]);

  return (
    <div className="flex flex-col gap-1">
      <FormField
        control={control}
        name={`questions.${index}.correctAnswer`}
        render={({ field: radioField }) => (
          <FormItem>
            <FormLabel>Please write the answer options and select correct answers</FormLabel>
            <RadioGroup onValueChange={radioField.onChange} value={radioField.value}>
              {fields.map((field, i) => (
                <FormField
                  control={control}
                  key={field.id}
                  name={`questions.${index}.answers.${i}.answer`}
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        placeholder={`Enter the ${i + 1}`}
                        maxLength={120}
                        {...field}
                        className={cn(
                          radioField.value === i.toString() && "border-green-600 bg-green-50",
                          questionType === "tf" && "cursor-pointer"
                        )}
                        readOnly={questionType === "tf"}
                        onClick={() => {
                          if (questionType === "tf") {
                            radioField.onChange(i.toString());
                          }
                        }}
                        startElement={<RadioGroupItem value={i.toString()} />}
                        endElement={
                          fields.length > 2 && (
                            <Button size="icon-sm" variant="ghost" onClick={() => remove(i)}>
                              <TrashIcon className="size-5" />
                            </Button>
                          )
                        }
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </RadioGroup>
          </FormItem>
        )}
      />
      {questionType === "mc" && fields.length < 4 && (
        <Button
          size="icon"
          className="rounded-full mx-auto flex mt-2"
          onClick={() => {
            append({ answer: "" });
          }}
        >
          <PlusIcon className="size-6" />
        </Button>
      )}
    </div>
  );
};

interface Step2Props {
  onBack: () => void;
}

export const Step2 = ({ onBack }: Step2Props) => {
  const { getValues: getStep1Values } = useStep1Form();
  const {
    control,
    formState: { errors },
    trigger,
    getValues,
  } = useStep2Form();

  const {
    fields,
    append,
    remove: _remove,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const activeQuestion = fields[activeQuestionIndex];

  const remove = (index: number) => {
    _remove(index);
    setActiveQuestionIndex((prev) => Math.min(prev > 0 ? prev - 1 : prev, fields.length - 2));
  };

  const router = useRouter();

  const { mutate: saveExam, isPending } = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      router.replace("/app");
      toast.success("Exam created successfully");
    },
    onError: (error) => {
      console.log("Error", error);
      toast.error("Failed to create exam");
    },
  });

  const handlePublish = async () => {
    const isValid = await trigger();
    const step1Values = getStep1Values();
    const step2Values = getValues();
    if (isValid) {
      saveExam({
        id: v4(),
        title: step1Values.title,
        description: step1Values.description,
        startDate: step1Values.startDate,
        duration: step1Values.duration,
        questions: step2Values.questions.map((question, i) => ({
          type: question.questionType,
          number: i + 1,
          text: question.question,
          description: question.question,
          options: question.answers.map((answer, i) => ({
            number: i + 1,
            text: answer.answer,
          })),
          correctAnswer: parseInt(question.correctAnswer) + 1,
        })),
        questionCount: step2Values.questions.length,
        isRewarded: false,
        rewardPerWinner: 0,
      });
    }
  };

  return (
    <Card className="mt-7 rounded-none md:rounded-3xl flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <ArrowLeftCircleIcon className="size-7 shrink-0" />
        <CardHeaderContent>
          <CardTitle>Create questions</CardTitle>
          <CardDescription>
            At this stage, create your questions and complete your quiz.
          </CardDescription>
        </CardHeaderContent>
        <Button onClick={handlePublish} className="w-40" disabled={isPending}>
          {isPending ? (
            <Spinner className="size-6" />
          ) : (
            <>
              Publish <PaperAirplaneIcon className="size-6" />
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="flex overflow-y-auto flex-1 gap-6 flex-col md:flex-row relative">
        <div
          className="mx-auto w-full flex flex-col flex-1 md:max-w-2xl gap-4"
          key={activeQuestion.id}
        >
          <FormField
            key={activeQuestion.id}
            control={control}
            name={`questions.${activeQuestionIndex}.questionType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex gap-2 items-center">
                  <QuestionMarkCircleIcon className="size-4" />
                  Question Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="box-border">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mc">Multiple Choice</SelectItem>
                    <SelectItem value="tf">True/False</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 flex-1">
            <FormField
              control={control}
              name={`questions.${activeQuestionIndex}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter the question</FormLabel>
                  <FormControl>
                    <MarkdownEditor
                      markdown={field.value}
                      onChange={field.onChange}
                      contentEditableClassName="overflow-y-auto "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Answers index={activeQuestionIndex} />
          </div>
          <Button onClick={onBack} variant="ghost" type="button">
            Back
          </Button>
        </div>

        <Card className="rounded-none md:rounded-3xl flex flex-col overflow-y-auto sticky top-0">
          <CardHeader className="font-semibold text-lg">Questions List</CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto">
            <div className="flex-1 flex flex-col">
              {fields.map((_, index) => (
                <QuestionListItem
                  key={index}
                  index={index}
                  onClick={() => setActiveQuestionIndex(index)}
                  isActive={activeQuestionIndex === index}
                  onRemove={fields.length > 1 ? remove : undefined}
                  isIncomplete={errors.questions && !!errors.questions[index]}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() =>
                append({
                  question: "",
                  correctAnswer: "0",
                  answers: [{ answer: "" }, { answer: "" }],
                  questionType: "mc",
                })
              }
            >
              <PlusIcon className="size-6" />
              Add Question
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};
