import { useFieldArray } from "react-hook-form";
import { useStep1Form } from "./step1-schema";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown";
import { useEffect, useRef, useState } from "react";
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
  ArrowRightIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { QuestionListItem } from "./question-list-item";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
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
  const { control, watch } = useStep1Form();
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

interface Step1Props {
  onNext: () => void;
}

export const Step1 = ({ onNext }: Step1Props) => {
  const {
    control,
    formState: { errors },
  } = useStep1Form();

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

  return (
    <Card className=" bg-base-white mt-7 rounded-none md:rounded-3xl flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>Create questions</CardTitle>
          <CardDescription>
            At this stage, create your questions and complete your quiz.
          </CardDescription>
        </CardHeaderContent>
        <Button onClick={onNext} className="w-40" pill>
          Next <ArrowRightIcon className="size-6" />
        </Button>
      </CardHeader>

      <CardContent className="flex overflow-y-auto flex-1 gap-6 flex-col md:flex-row relative">
        <div
          className="mx-auto w-full flex flex-col flex-2 md:max-w-2xl gap-4"
          key={activeQuestion.id}
        >

          <div className="flex flex-col gap-4 flex-0">
          <FormField
            key={activeQuestion.id}
            control={control}
            name={`questions.${activeQuestionIndex}.questionType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="z-index-10 flex gap-2 items-center rounded-full">
                  Question Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="box-border">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50">
                    <SelectItem value="mc">Multiple Choice</SelectItem>
                    <SelectItem value="tf">True/False</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
              )}
            />  
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
              onClick={() => {
                append({
                  question: "",
                  correctAnswer: "0",
                  answers: [{ answer: "" }, { answer: "" }],
                  questionType: "mc",
                });
                setActiveQuestionIndex(fields.length);
              }}
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
