"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { step1ValidationSchema, useStep1Form } from "./step1-schema";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
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
import {
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { QuestionListItem } from "./question-list-item";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import BGR from "@/images/backgrounds/bg-8-20.svg";
import { SaveAsDraftButton } from "@/components/create-exam/save-as-draft-button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { MediaUpload } from "./media-upload";

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
    defaultValues: {
      correctAnswer: "",
    },
    resolver: zodResolver(step1ValidationSchema),
  });

  const questionType = form.watch(`questions.${index}.questionType`);
  const prevQuestionType = useRef(questionType);

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

  // Mobilde tek sütun, desktop'ta 2'li grid
  const radioGroupClassName = "grid grid-cols-1 md:grid-cols-2 gap-2 w-full";

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name={`questions.${index}.correctAnswer`}
        render={({ field: radioField }) => (
          <FormItem className="mb-4">
            <FormLabel>Answer options</FormLabel>

            {/* Responsive grid container */}
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
                const isOverLimit = charCount > 76; // Örneğin 76 karakter sınırı
                const hasTrashIcon = fields.length > 2;

                // True/False renklendirme
                const isTrueOption = field.answer === "True";
                const isFalseOption = field.answer === "False";
                const isSelected = radioField.value === i.toString();

                let tfColorClass = "";
                if (questionType === "tf" && isTrueOption) {
                  tfColorClass = isSelected
                    ? "bg-green-100 border-green-400 text-green-800 text-xl min-h-[6rem] max-h-[6rem] font-bold hover:bg-green-200"
                    : "bg-green-50 text-green-700 border-green-200 text-xl min-h-[6rem] max-h-[6rem] font-bold hover:bg-green-100";
                } else if (questionType === "tf" && isFalseOption) {
                  tfColorClass = isSelected
                    ? "bg-red-100 border-red-400 text-red-800 text-xl min-h-[6rem] max-h-[6rem] font-bold hover:bg-red-200"
                    : "bg-red-50 text-red-700 border-red-200 text-xl min-h-[6rem] max-h-[6rem] font-bold hover:bg-red-100";
                }

                return (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`questions.${index}.answers.${i}.answer`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-full">
                        <div className="relative">
                          <Input
                            as="textarea"
                            placeholder={`Option ${i + 1}`}
                            maxLength={76}
                            {...inputField}
                            // Değişiklik yapıldığında
                            onKeyDown={(e: { key: string; preventDefault: () => void }) => {
                              if (e.key === "Enter") {
                                e.preventDefault(); // Enter'ı iptal: yeni satır olmayacak
                              }
                            }}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                              inputField.onChange(e);
                              form.setValue(
                                `questions.${index}.answers.${i}.answer`,
                                e.target.value
                              );
                            }}
                            className={cn(
                              "pl-12 pr-32 py-6 min-h-[80px] w-full rounded-3xl border items-center transition-colors duration-200",
                              questionType === "tf" && tfColorClass,
                              isSelected && questionType !== "tf"
                                ? "border-2 border-brand-primary-900 bg-brand-secondary-50 ring-0"
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
                            // Input'un solunda radio item
                            startElement={
                              <RadioGroupItem value={i.toString()} checked={isSelected} />
                            }
                            // Sağ tarafta silme butonu
                            endElement={
                              hasTrashIcon && (
                                <div className="relative group inline-block">
                                  <Button size="icon-sm" variant="ghost" onClick={() => remove(i)}>
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
                          {/* Karakter sayısı (tf dışında göster) */}
                          {questionType !== "tf" && (
                            <div
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 text-sm bg-transparent px-1 z-10",
                                hasTrashIcon ? "right-10" : "right-4",
                                isOverLimit ? "text-red-500" : "text-greyscale-light-500"
                              )}
                            >
                              {`${inputField.value?.length || 0}/76`}
                            </div>
                          )}
                        </div>
                        {isOverLimit && (
                          <p className="text-red-500 text-sm mt-1">
                            The answer option exceeds the maximum allowed 76 characters.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                );
              })}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Çoktan seçmeli (mc) -> en fazla 4 */}
      {form.watch(`questions.${index}.questionType`) === "mc" && fields.length < 4 && (
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

  // Field Array => questions
  const {
    fields,
    insert,
    remove: removeQuestion,
    move, // Reordering eklendi
  } = useFieldArray({
    control,
    name: "questions",
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questions = watch("questions");
  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);
  const activeQuestion = fields[activeQuestionIndex];

  // Refs for auto-scroll
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 2 sn sonra highlight iptal
  useEffect(() => {
    if (recentlyAddedIndex !== null) {
      const timer = setTimeout(() => setRecentlyAddedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedIndex]);

  // remove question callback + aktif index güncelle
  const remove = (index: number) => {
    removeQuestion(index);
    setActiveQuestionIndex((prev) => Math.min(prev > 0 ? prev - 1 : prev, fields.length - 2));
  };

  useEffect(() => {
    if (questions.length > 0 && questionRefs.current && questionRefs.current[activeQuestionIndex]) {
      questionRefs.current[activeQuestionIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeQuestionIndex, questions]);

  // "Next" => validasyon
  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) {
      const questionsWithErrors = errors.questions ? Object.keys(errors.questions).map(Number) : [];
      toast(
        `Please complete this questions:\n\n${questionsWithErrors.map((q) => q + 1).join(", ")}`,
        { duration: 9000 }
      );
      return;
    }
    onNext();
  };

  // Kaç tane tamamlandı?
  const completedCount = questions.filter((q) => q.question && q.correctAnswer).length;
  const totalCount = fields.length;

  const handleMove = useCallback(
    (currentIndex: number, direction: number) => {
      const newIndex = currentIndex + direction;
      move(currentIndex, newIndex);
      setActiveQuestionIndex(newIndex); // Aktif indeksi yeni pozisyona güncelle

      // Scroll işlemi için 50ms sonra tetikle (state güncellemesi tamamlansın diye)
      setTimeout(() => {
        questionRefs.current[newIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    },
    [move]
  );

  return (
    <Card className="flex-1 flex flex-col overflow-y-auto">
      <CardHeader>
        {/* Sol buton (dummy) */}
        <Button
          onClick={() => {}}
          variant="outline"
          className="hidden md:block items-center justify-center stroke-current text-3xl align-middle cursor-pointer bg-brand-secondary-200 text-brand-primary-900 hover:brand-secondary-200 hover:cursor-default"
          size="icon"
          pill
        >
          ☺︎
        </Button>
        <CardHeaderContent>
          <CardTitle>Let's create your questions!</CardTitle>
        </CardHeaderContent>

        <div className="flex flex-col items-end gap-1 mr-4">
          <p className="text-sm text-greyscale-light-600 hidden md:block">
            {completedCount} / {totalCount} completed
          </p>
          <div className="w-32 h-2 bg-greyscale-light-300 rounded-full overflow-hidden hidden md:block">
            <div
              className="bg-brand-primary-700 h-full transition-all duration-300"
              style={{ width: `${(completedCount / Math.max(1, totalCount)) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-row">
          <SaveAsDraftButton />
          <Button size="icon" onClick={onNext} pill>
            <ArrowRightIcon className="size-6" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex overflow-y-auto flex-1 gap-6 flex-col md:flex-row relative p-5">
        {/* Sol tarafta aktif soru */}
        <div className="w-full flex flex-col flex-1 md:max-w-full gap-4" key={activeQuestion.id}>
          <div className="flex flex-col gap-6 flex-0">
            <FormField
              control={control}
              name={`questions.${activeQuestionIndex}.questionType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select question type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mc">Multiple choice</SelectItem>
                        <SelectItem value="tf">True/False</SelectItem>
                        <SelectItem disabled value="ord">
                          Ordering (soon)
                        </SelectItem>
                        {/* Diğer disabled seçenekler... */}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-sm text-greyscale-light-600 hidden md:block">
                    E.g. choose "Multiple choice" for up to 4 options, "True/False" for binary
                    questions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* question (markdown) */}
            <FormField
              control={control}
              name={`questions.${activeQuestionIndex}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enter the question below. You can use the markdown editor to customize it ☺︎
                  </FormLabel>

                  <FormControl>
                    <div className="border border-greyscale-light-200 rounded-2xl min-h-[15rem] max-h-[60rem] bg-base-white resize-y overflow-y-auto ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-800">
                      <MarkdownEditor
                        className="mdxeditor w-full h-full"
                        markdown={field.value}
                        onChange={field.onChange}
                        contentEditableClassName="contentEditable"
                        placeholder="E.g. What is the capital of France?"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Answers */}
            <Answers index={activeQuestionIndex} />
          </div>
        </div>

        {/* Sağ tarafta soru listesi */}
        <Card>
          <CardHeader className="px-5 min-w-[20rem] min-h-[4rem] max-h-[4rem]">
            <CardTitle>Question List</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto mb-4 max-h-[200px] lg:max-h-full">
            <div className="flex-1 flex flex-col">
              {fields.map((_, index) => {
                const questionHasError = errors.questions && !!errors.questions[index];

                // Sıra belirleme
                const isFirst = index === 0;
                const isLast = index === fields.length - 1;

                return (
                  <div
                    key={index}
                    className="relative w-full border-b border-brand-secondary-100 last:border-none"
                    ref={(el) => {
                      if (el) questionRefs.current[index] = el;
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <QuestionListItem
                        index={index}
                        onClick={() => setActiveQuestionIndex(index)}
                        isActive={activeQuestionIndex === index}
                        onRemove={fields.length > 1 ? remove : undefined}
                        isIncomplete={questionHasError}
                        questionText={questions[index]?.question || `NO CONTENT`}
                        className="flex-1"
                        isFirst={index === 0}
                        isLast={index === fields.length - 1}
                        canMoveUp={index > 0}
                        canMoveDown={index < fields.length - 1}
                        onMoveUp={() => handleMove(index, -1)}
                        onMoveDown={() => handleMove(index, 1)}
                      />
                    </div>

                    {recentlyAddedIndex === index && (
                      <div className="absolute -top-4 left-0 bg-green-100 text-green-800 text-xs py-1 px-2 rounded shadow">
                        ✨ New question added!
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
                icon
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
                Add question
                <PlusIcon className="h-5 w-5 stroke-current" />
              </Button>
              <FormMessage />
            </FormItem>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};
