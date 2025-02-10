"use client";

// ---------------------------------------------------
// 1) Gerekli importlar
// ---------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ArrowRightIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// UI bileşenleri (örnek)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Projenizdeki placeholder bileşenler
import { SaveAsDraftButton } from "@/components/create-exam/save-as-draft-button";
import { QuestionListItem } from "@/components/create-exam/question-list-item";
import { MarkdownEditor } from "@/components/create-exam/markdown";

import { step1ValidationSchema, Step1FormValues } from "./step1-schema";
import { cn } from "@/lib/utils";

// ---------------------------------------------------
// 2) React Hook Form Ayarları
// ---------------------------------------------------
function useStep1BaseForm() {
  return useForm<Step1FormValues>({
    resolver: zodResolver(step1ValidationSchema),
    mode: "onChange", // her tuşa basışta doğrulama
    reValidateMode: "onChange",
    defaultValues: {
      questions: [
        {
          question: "",
          questionType: "mc",
          correctAnswer: "",
          answers: [{ answer: "" }, { answer: "" }],
        },
      ],
    },
  });
}

export function useStep1Form() {
  return useFormContext<Step1FormValues>();
}

// ---------------------------------------------------
// 3) Answers Bileşeni (karakter sayacı X/100)
// ---------------------------------------------------
interface AnswersProps {
  index: number; // Sorunun index'i
}

function Answers({ index }: AnswersProps) {
  const form = useStep1Form();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: `questions.${index}.answers`,
  });

  // Hangi radio seçili
  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  const handleSelection = (value: string) => {
    setSelectedValue(value);
    form.setValue(`questions.${index}.correctAnswer`, value);
  };

  // TF / MC değişimi
  const questionType = form.watch(`questions.${index}.questionType`);
  const prevQuestionType = useRef(questionType);

  useEffect(() => {
    if (questionType === prevQuestionType.current) return;

    if (questionType === "tf") {
      replace([{ answer: "True" }, { answer: "False" }]);
    } else if (questionType === "mc") {
      replace([{ answer: "" }, { answer: "" }]);
    }
    prevQuestionType.current = questionType;
  }, [questionType, replace]);

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name={`questions.${index}.correctAnswer`}
        render={({ field: radioField }) => (
          <FormItem className="mb-4">
            <FormLabel>Answer options</FormLabel>
            <RadioGroup
              className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full"
              value={selectedValue}
              onValueChange={(val) => {
                handleSelection(val);
                form.clearErrors(`questions.${index}.correctAnswer`);
              }}
              onBlur={() => form.trigger(`questions.${index}.correctAnswer`)}
            >
              {fields.map((field, i) => {
                // Anlık answer
                const answerValue = form.watch(`questions.${index}.answers.${i}.answer`) || "";
                // Seçili mi
                const isSelected = radioField.value === i.toString();

                // TF renklendirme
                let tfColorClass = "";
                if (questionType === "tf") {
                  if (answerValue === "True") {
                    tfColorClass = isSelected
                      ? "bg-green-50 border border-green-600 text-green-900 shadow-sm hover:bg-green-100"
                      : "bg-green-50/50 text-green-800 border-green-200 hover:bg-green-100";
                  } else if (answerValue === "False") {
                    tfColorClass = isSelected
                      ? "bg-red-50 border border-red-600 text-red-900 shadow-sm hover:bg-red-100"
                      : "bg-red-50/50 text-red-800 border-red-200 hover:bg-red-100";
                  }
                }

                const hasTrashIcon = fields.length > 2; // 2 cevaptan fazla ise sil butonu

                return (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`questions.${index}.answers.${i}.answer`}
                    render={({ field: inputField, fieldState }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="relative">
                            <Input
                              as="textarea"
                              placeholder={`Option ${i + 1}`}
                              value={inputField.value || ""}
                              onChange={(e) => {
                                inputField.onChange(e);
                                form.setValue(
                                  `questions.${index}.answers.${i}.answer`,
                                  e.target.value
                                );
                              }}
                              className={cn(
                                "min-h-[5rem] overflow-y-auto pl-12 pr-16 py-2 w-full rounded-2xl border text-xl md:text-2xl font-medium transition-all duration-200",
                                questionType === "tf" && tfColorClass,
                                isSelected && questionType !== "tf"
                                  ? "outline outline-2 outline-brand-primary-900 bg-brand-secondary-50 ring-0"
                                  : "",
                                questionType === "tf" && "cursor-pointer",
                                fieldState.error ? "border-red-500 focus:ring-red-500" : ""
                              )}
                              readOnly={questionType === "tf"}
                              onClick={() => {
                                if (questionType === "tf") {
                                  radioField.onChange(i.toString());
                                  handleSelection(i.toString());
                                }
                              }}
                              startElement={
                                <RadioGroupItem
                                  className="size-6 mt-2"
                                  value={i.toString()}
                                  checked={isSelected}
                                />
                              }
                              endElement={
                                hasTrashIcon && (
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => {
                                      remove(i);
                                      setTimeout(() => form.trigger(), 100);
                                    }}
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </Button>
                                )
                              }
                            />
                            {/* TF hariç karakter sayacı X/100 */}
                            {questionType !== "tf" && (
                              <div
                                className={cn(
                                  "absolute top-2 right-2 text-xs bg-white/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md",
                                  answerValue.length > 100 ? "text-red-500" : "text-gray-500"
                                )}
                              >
                                {`${answerValue.length}/100`}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        {/* Zod hata mesajı (örn. "Answer cannot exceed 100 characters.") */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </RadioGroup>
            {/* correctAnswer alanı (örn. "Select a correct answer") */}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* MC -> max 4 cevap */}
      {form.watch(`questions.${index}.questionType`) === "mc" && fields.length < 4 && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full mx-auto flex mt-2 mb-4"
          onClick={() => {
            append({ answer: "" });
          }}
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------
// 4) Step1 Bileşeni (Ana Form)
// ---------------------------------------------------
interface Step1Props {
  onNext: () => void;
}

export function Step1({ onNext }: Step1Props) {
  const methods = useStep1BaseForm();
  const {
    control,
    formState: { errors },
    trigger,
    watch,
  } = methods;

  // Sorular field array
  const {
    fields,
    insert,
    remove: removeQuestion,
    move,
  } = useFieldArray({
    control,
    name: "questions",
  });

  // Aktif soru index'i
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questions = watch("questions");

  // Yeni eklenen soru highlight
  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 2sn sonra highlight iptal
  useEffect(() => {
    if (recentlyAddedIndex !== null) {
      const t = setTimeout(() => setRecentlyAddedIndex(null), 2000);
      return () => clearTimeout(t);
    }
  }, [recentlyAddedIndex]);

  // Soru sil
  const remove = (idx: number) => {
    removeQuestion(idx);
    setActiveQuestionIndex((prev) => {
      const newLength = fields.length - 1;
      if (prev > idx) {
        return Math.min(prev - 1, newLength - 1);
      }
      return Math.min(prev, newLength - 1);
    });
  };

  // Scroll to active
  useEffect(() => {
    if (questions.length > 0 && questionRefs.current[activeQuestionIndex]) {
      questionRefs.current[activeQuestionIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeQuestionIndex, questions.length]);

  // Next buton -> validasyon
  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) {
      const questionsWithErrors = errors.questions ? Object.keys(errors.questions).map(Number) : [];
      toast(`Please fix these questions:\n${questionsWithErrors.map((q) => q + 1).join(", ")}`, {
        duration: 9000,
      });
      return;
    }
    onNext();
  };

  // Tamamlanma sayısı
  const completedCount = questions.filter((q) => q.question && q.correctAnswer).length;
  const totalCount = fields.length;

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(
    pointerSensor,
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== newIndex) {
      move(oldIndex, newIndex);
      setActiveQuestionIndex(newIndex);
    }
  };

  const activeQuestion = fields[activeQuestionIndex];

  // FormProvider
  return (
    <FormProvider {...methods}>
      <Card className="flex-1 flex flex-col overflow-y-auto bg-brand-secondary-50">
        {/* —— CARD HEADER —— */}
        <CardHeader>
          {/* Soldaki dummy buton */}
          <Button
            onClick={() => {}}
            variant="outline"
            className="hidden md:block items-center justify-center stroke-current text-3xl align-middle cursor-pointer bg-brand-secondary-50 text-brand-primary-900 hover:bg-brand-secondary-50 hover:cursor-default"
            size="icon"
            pill
          >
            <span className="text-2xl">💜</span>
          </Button>

          <CardHeaderContent>
            <CardTitle>Let's create your questions!</CardTitle>
          </CardHeaderContent>

          {/* Tamamlama göstergesi */}
          <div className="flex flex-col items-end gap-1 mr-4">
            <p className="text-sm text-gray-600 hidden md:block">
              {completedCount} / {totalCount} completed
            </p>
            <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden hidden md:block">
              <div
                className="bg-brand-primary-700 h-full transition-all duration-300"
                style={{
                  width: `${(completedCount / Math.max(1, totalCount)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Sağdaki butonlar: Taslak / Next */}
          <div className="flex items-center gap-2 flex-row">
            <SaveAsDraftButton />
            <Button size="icon" onClick={handleNext} pill>
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        {/* —— CARD CONTENT —— */}
        <CardContent className="flex overflow-y-auto flex-1 gap-5 flex-col lg:flex-row p-5 relative">
          {/* Sol: Soru Listesi */}
          <Card className="border shadow-sm w-full lg:max-w-[280px] flex-row sm:flex-col sticky bottom-0 md:top-0">
            <div className="px-4 py-3 bg-white border-b-2 hidden md:block">
              <CardTitle className="text-lg">Question List</CardTitle>
            </div>
            <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto mb-4 lg:max-h-full">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                  <div className="flex-1 flex flex-row sm:flex-col gap-2 mt-4 overflow-y-auto">
                    {fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="relative w-full border-b border-gray-100 last:border-none transition-all duration-200 hover:scale-[1.005] hover:shadow-sm"
                        ref={(el) => {
                          if (el) questionRefs.current[idx] = el;
                        }}
                      >
                        <SortableQuestionListItem
                          onClick={() => setActiveQuestionIndex(idx)}
                          id={field.id}
                          index={idx}
                          isActive={activeQuestionIndex === idx}
                          onRemove={fields.length > 1 ? remove : undefined}
                          isIncomplete={errors.questions && !!errors.questions[idx]}
                          questionText={questions[idx]?.question || `NO CONTENT`}
                        />

                        {recentlyAddedIndex === idx && (
                          <div className="absolute -top-4 left-0 bg-green-100 text-green-800 text-xs py-1 px-2 rounded shadow animate-zoom-in">
                            ✨ New question added!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
                      questionType: "mc",
                      correctAnswer: "",
                      answers: [{ answer: "" }, { answer: "" }],
                    });
                    setActiveQuestionIndex(newIndex);
                    setRecentlyAddedIndex(newIndex);
                  }}
                  className="hover:scale-105 transition-transform duration-200 active:scale-95 animate-in fade-in-50"
                >
                  <span className="sm:inline hidden">Add question</span>
                  <PlusIcon className="h-5 w-5 stroke-current" />
                </Button>
                <FormMessage />
              </FormItem>
            </CardFooter>
          </Card>

          {/* Orta: Aktif Soru */}
          <div
            className="w-full flex flex-col bg-white flex-1 gap-5 p-5 border min-h-[200px] h-full border-gray-200 rounded-3xl shadow-sm overflow-y-auto"
            key={activeQuestion?.id}
          >
            <div className="w-full flex flex-col flex-1 md:max-w-full gap-4">
              <div className="flex flex-col gap-5 flex-1">
                {/* Soru metni */}
                <FormField
                  control={control}
                  name={`questions.${activeQuestionIndex}.question`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="hidden md:block">Enter the question below:</FormLabel>
                      <FormControl>
                        <div className="border border-gray-200 rounded-2xl pb-5 min-h-[18rem] max-h-[68rem] bg-white resize-y overflow-y-auto ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-800">
                          <MarkdownEditor
                            className="w-full h-full"
                            markdown={field.value}
                            onChange={field.onChange}
                            placeholder="E.g. What is the capital of France?"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cevaplar (Answers) */}
                <Answers index={activeQuestionIndex} />
              </div>
            </div>
          </div>

          {/* Sağ: Ek ayarlar */}
          <Card className="flex flex-col gap-5 bg-white rounded-3xl border border-gray-200 min-h-[200px]">
            <div className="px-4 py-3 bg-white border-b-2 hidden md:block">
              <CardTitle className="text-lg">Question settings</CardTitle>
            </div>
            <CardContent>
              <div className="flex flex-col gap-5">
                <FormField
                  control={control}
                  name={`questions.${activeQuestionIndex}.questionType`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Question type:</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full sm:min-w-[12rem]">
                            <SelectValue placeholder="Select a question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mc">Multiple choice</SelectItem>
                            <SelectItem value="tf">True/False</SelectItem>
                            {/* <SelectItem value="ord">Ordering (soon)</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

// ---------------------------------------------------
// 5) SortableQuestionListItem (DnD kit için)
// ---------------------------------------------------
interface SortableQuestionListItemProps {
  id: string;
  index: number;
  onClick: () => void;
  onRemove?: (idx: number) => void;
  isActive: boolean;
  isIncomplete?: boolean;
  questionText: string;
  dragHandle?: React.ReactNode;
}

function SortableQuestionListItem({ id, index, ...props }: SortableQuestionListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionListItem
        index={index}
        {...props}
        isActive={props.isActive}
        dragHandle={<DragHandle />}
      />
    </div>
  );
}

// Drag handle ikonu (isteğe bağlı)
function DragHandle() {
  return (
    <div className="mr-2 p-1 hover:bg-gray-100 rounded-lg">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-400"
      >
        <path
          d="M5 3.5C5 4.32843 4.32843 5 3.5 5C2.67157 5 2 4.32843 2 3.5C2 2.67157 2.67157 2 3.5 2C4.32843 2 5 2.67157 5 3.5Z"
          fill="currentColor"
        />
        <path
          d="M5 10.5C5 11.3284 4.32843 12 3.5 12C2.67157 12 2 11.3284 2 10.5C2 9.67157 2.67157 9 3.5 9C4.32843 9 5 9.67157 5 10.5Z"
          fill="currentColor"
        />
        <path
          d="M8.5 5C9.32843 5 10 4.32843 10 3.5C10 2.67157 9.32843 2 8.5 2C7.67157 2 7 2.67157 7 3.5C7 4.32843 7.67157 5 8.5 5Z"
          fill="currentColor"
        />
        <path
          d="M10 10.5C10 11.3284 9.32843 12 8.5 12C7.67157 12 7 11.3284 7 10.5C7 9.67157 7.67157 9 8.5 9C9.32843 9 10 9.67157 10 10.5Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
