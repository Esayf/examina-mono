import { useFieldArray, useForm } from "react-hook-form";
import { step1ValidationSchema, useStep1Form } from "./step1-schema";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import DashboardHeader from "@/components/ui/dashboard-header";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { QuestionListItem } from "./question-list-item";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import BGR from "@/images/backgrounds/bg-8-20.svg";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast"; // react-hot-toast import

/************************************
 * Answers Component
 ************************************/
interface AnswersProps {
  index: number;
}

export function Answers({ index }: AnswersProps) {
  const form = useStep1Form();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: `questions.${index}.answers`,
  });

  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  const handleSelection = (value: string) => {
    setSelectedValue(value);
    form.setValue(`questions.${index}.correctAnswer`, value);
  };

  // Opsiyonel correctAnswer form
  const correctAnswerForm = useForm({
    defaultValues: { correctAnswer: "" },
    resolver: zodResolver(step1ValidationSchema),
  });

  const questionType = form.watch(`questions.${index}.questionType`);
  const prevQuestionType = useRef(questionType);
  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);

  // questionType değişince tf -> [True,False], mc -> ["",""]
  useEffect(() => {
    if (questionType === prevQuestionType.current) return;

    if (questionType === "tf") {
      replace([{ answer: "True" }, { answer: "False" }]);
    } else if (questionType === "mc") {
      replace([{ answer: "" }, { answer: "" }]);
    }
    prevQuestionType.current = questionType;
  }, [questionType, replace]);

  // highlight new answer when changed
  useEffect(() => {
    const subscription = form.watch((_, { name, type }) => {
      if (name?.startsWith("questions") && type === "change") {
        const currentIndex = parseInt(name.split(".")[1], 10);
        setRecentlyAddedIndex(currentIndex);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const radioGroupClassName =
    questionType === "tf" ? "grid grid-cols-2 gap-2 w-full min-h-[64px]" : "flex flex-col gap-2";

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name={`questions.${index}.correctAnswer`}
        render={({ field: radioField }) => (
          <FormItem className="mb-4">
            <FormLabel className="flex gap-2 items-center rounded-full">
              Enter the answer options and select the correct one
            </FormLabel>
            <RadioGroup
              className={radioGroupClassName}
              value={selectedValue}
              onValueChange={(value) => {
                handleSelection(value);
                form.clearErrors(`questions.${index}.correctAnswer`);
              }}
              onBlur={() => form.trigger(`questions.${index}.correctAnswer`)}
            >
              {fields.map((field, i) => {
                const charCount = field.answer?.length || 0;
                const isOverLimit = charCount > 200;
                const hasTrashIcon = fields.length > 2;

                // True/False renklendirme
                const isTrueOption = field.answer === "True";
                const isFalseOption = field.answer === "False";
                const isSelected = radioField.value === i.toString();

                // Renk ayarları
                let tfColorClass = "";
                if (questionType === "tf" && isTrueOption) {
                  tfColorClass = isSelected
                    ? "bg-green-100 border-green-400 text-green-800 hover:bg-green-200 focus-visible-ring-green-800"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
                } else if (questionType === "tf" && isFalseOption) {
                  tfColorClass = isSelected
                    ? "bg-red-100 border-red-400 text-red-800 hover:bg-red-200"
                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
                }

                return (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`questions.${index}.answers.${i}.answer`}
                    render={({ field: inputField }) => (
                      <>
                        <FormItem>
                          <div className="relative">
                            <Input
                              placeholder={`Enter the ${i + 1}. option`}
                              maxLength={200}
                              {...inputField}
                              onChange={(e) => inputField.onChange(e)}
                              className={cn(
                                "gap-4 pl-12 pr-32 py-6 rounded-2xl border transition-colors duration-200",

                                questionType === "tf" && tfColorClass,
                                isSelected && questionType !== "tf"
                                  ? "border-greyscale-light-200 bg-brand-secondary-50 ring-0"
                                  : "",

                                questionType === "tf" && "cursor-pointer",
                                isOverLimit ? "border-ui-error-500 focus:ring-ui-error-500" : ""
                              )}
                              readOnly={questionType === "tf"}
                              onClick={() => {
                                if (questionType === "tf") {
                                  radioField.onChange(i.toString());
                                  handleSelection(i.toString());
                                  form.setValue(`questions.${index}.correctAnswer`, i.toString());
                                }
                              }}
                              startElement={
                                <RadioGroupItem value={i.toString()} checked={isSelected} />
                              }
                              endElement={
                                hasTrashIcon && (
                                  <div className="relative group inline-block">
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      onClick={() => remove(i)}
                                    >
                                      <XMarkIcon className="size-4" />
                                    </Button>
                                    <div
                                      className={`
                                        hidden group-hover:block
                                        absolute -top-10 left-1/2 -translate-x-1/2
                                        px-2 py-1 rounded-md text-white bg-black
                                        text-xs whitespace-nowrap
                                        animate-fadeIn z-50
                                      `}
                                    >
                                      Are you sure?
                                    </div>
                                  </div>
                                )
                              }
                            />
                            {questionType !== "tf" && (
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 text-sm bg-transparent px-1 z-10",
                                  hasTrashIcon ? "right-10" : "right-4",
                                  isOverLimit ? "text-red-500" : "text-greyscale-light-500"
                                )}
                              >
                                {`${inputField.value?.length || 0}/200`}
                              </div>
                            )}
                          </div>
                          {isOverLimit && (
                            <p className="text-red-500 text-sm mt-1">
                              The answer option exceeds the maximum allowed 200 characters.
                            </p>
                          )}
                        </FormItem>
                        <FormMessage />
                      </>
                    )}
                  />
                );
              })}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch(`questions.${index}.questionType`) === "mc" && fields.length < 6 && (
        <Button
          variant={"outline"}
          size="icon"
          className="rounded-full mx-auto flex mt-2 mb-4"
          onClick={() => {
            append({ answer: "" });
          }}
        >
          <PlusIcon className="size-6" />
        </Button>
      )}
    </div>
  );
}

/************************************
 * Step1 Component
 ************************************/
interface Step1Props {
  onNext: () => void;
}

export const Step1 = ({ onNext }: Step1Props) => {
  const {
    control,
    formState: { errors },
    trigger,
    watch,
  } = useStep1Form();

  const {
    fields,
    insert,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questions = watch("questions");
  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);
  const activeQuestion = fields[activeQuestionIndex];

  useEffect(() => {
    if (recentlyAddedIndex !== null) {
      const timer = setTimeout(() => setRecentlyAddedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedIndex]);

  // remove question callback
  const remove = (index: number) => {
    removeQuestion(index);
    // Aktif sorunun index’ini güncelle
    setActiveQuestionIndex((prev) => Math.min(prev > 0 ? prev - 1 : prev, fields.length - 2));
  };

  const handleNext = async () => {
    // Form validasyonu
    const isValid = await trigger();
    if (!isValid) {
      const questionsWithErrors = errors.questions
        ? Object.keys(errors.questions).map((key) => Number(key))
        : [];
      toast(
        `Ooops, some questions seem lonely! Mind giving them a look? 🥺 : ${questionsWithErrors
          .map((q) => q + 1)
          .join(", ")}`,
        { duration: 9000 }
      );
      return;
    }
    onNext();
  };

  return (
    <Card className="flex-1 flex flex-col overflow-y-auto">
      <CardHeader>
        <Button
          onClick={() => {}}
          variant="outline"
          className="flex items-center justify-center stroke-current text-3xl align-middle cursor-pointer bg-brand-secondary-200 text-brand-primary-900 hover:brand-secondary-200 hover:cursor-default"
          size="icon"
          pill
        >
          ☺︎
        </Button>
        <CardHeaderContent>
          <CardTitle>Let’s create your questions!</CardTitle>
          <CardDescription>
            Create questions that inspire, challenge, and engage participants for a truly
            interactive experience.
          </CardDescription>
        </CardHeaderContent>
        <Button variant="outline" size="icon" onClick={handleNext} pill>
          <ArrowRightIcon className="size-6" />
        </Button>
      </CardHeader>

      <CardContent className="flex overflow-y-auto flex-1 gap-6 flex-col md:flex-row relative p-5">
        {/* Sol tarafta aktif soru */}
        <div className="w-full flex flex-col flex-1 md:max-w-full gap-4" key={activeQuestion.id}>
          <div className="flex flex-col gap-6 flex-0">
            <FormField
              key={activeQuestion.id}
              control={control}
              name={`questions.${activeQuestionIndex}.questionType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center rounded-full">
                    Select the question type
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="box-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-50 max-h-48 overflow-y-auto">
                      <SelectItem value="mc">Multiple choice</SelectItem>
                      <SelectItem value="tf">True/False</SelectItem>
                      {/* Diğerleri devre dışı (yakında) */}
                      <SelectItem disabled value="ord">
                        Ordering (soon)
                      </SelectItem>
                      <SelectItem disabled value="ma">
                        Matching (soon)
                      </SelectItem>
                      <SelectItem disabled value="sa">
                        Likert (soon)
                      </SelectItem>
                      <SelectItem disabled value="ps">
                        Poll/Survey (soon)
                      </SelectItem>
                      <SelectItem disabled value="dd">
                        Drag and Drop (soon)
                      </SelectItem>
                      <SelectItem disabled value="vb">
                        Video based (soon)
                      </SelectItem>
                      <SelectItem disabled value="ib">
                        Image based (soon)
                      </SelectItem>
                      <SelectItem disabled value="ess">
                        Essay (soon)
                      </SelectItem>
                      <SelectItem disabled value="fill">
                        Fill in the blank (soon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Soru metni (Markdown) */}
            <FormField
              control={control}
              name={`questions.${activeQuestionIndex}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-2 items-center rounded-full">
                    Enter the question below. You can use the markdown editor to customize it ☺︎
                  </FormLabel>
                  <FormControl>
                    <div className="border border-greyscale-light-200 rounded-2xl min-h-[240px] max-h-[960px] bg-base-white resize-y overflow-y-auto ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-800">
                      <MarkdownEditor
                        className="mdxeditor w-full h-full"
                        markdown={field.value}
                        onChange={field.onChange}
                        contentEditableClassName="contentEditable"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cevap şıkları */}
            <Answers index={activeQuestionIndex} />
          </div>
        </div>

        {/* Sağ tarafta soru listesi */}
        <Card>
          <CardHeader className="px-5 min-h-[68px] max-h-[68px]">Questions List</CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto mb-4">
            <div className="flex-1 flex flex-col">
              {fields.map((_, index) => {
                const questionHasError = errors.questions && !!errors.questions[index];
                return (
                  <div key={index} className="relative w-full">
                    <QuestionListItem
                      index={index}
                      onClick={() => setActiveQuestionIndex(index)}
                      isActive={activeQuestionIndex === index}
                      onRemove={fields.length > 1 ? remove : undefined}
                      isIncomplete={questionHasError}
                      questionText={questions[index]?.question || "No content!"}
                    />
                    {recentlyAddedIndex === index && (
                      <div className="absolute top-[-30px] left-0 bg-green-100 text-green-800 text-xs py-1 px-2 rounded shadow">
                        New question added!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <FormItem>
              <Button
                variant="outline"
                size="default"
                icon={true}
                iconPosition="right"
                onClick={() => {
                  const newIndex = activeQuestionIndex + 1;
                  insert(newIndex, {
                    question: "",
                    correctAnswer: "",
                    answers: [{ answer: "" }, { answer: "" }],
                    questionType: "mc",
                  });
                  setActiveQuestionIndex(newIndex);
                  setRecentlyAddedIndex(newIndex);
                }}
              >
                <span className="hidden md:block">Add question</span>
                <PlusIcon className="size-5 h-5 w-5 stroke-current" />
                <FormMessage />
              </Button>
            </FormItem>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};
