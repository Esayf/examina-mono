import { useFieldArray, useForm } from "react-hook-form";
import { step1ValidationSchema, useStep1Form } from "./step1-schema";
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
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveAsDraftButton } from "./save-as-draft-button";

interface AnswersProps {
  index: number;
}
const Answers = ({ index }: AnswersProps) => {
  const form = useStep1Form();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: `questions.${index}.answers`,
  });

  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  // Seçim kontrolü için handleSelection fonksiyonu
  const handleSelection = (value: string) => {
    setSelectedValue(value); // State'i günceller
    form.setValue(`questions.${index}.correctAnswer`, value); // Formik kontrolünü günceller
  };

  const correctAnswerForm = useForm({
    defaultValues: {
      correctAnswer: "",
    },
    resolver: zodResolver(step1ValidationSchema), // Zod resolver kullanımı
  });

  const questionType = form.watch(`questions.${index}.questionType`);

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
        control={form.control}
        name={`questions.${index}.correctAnswer`}
        render={({ field: radioField }) => (
          <FormItem>
            <FormLabel className="flex gap-2 items-center rounded-full">
              Enter the answer options and select the correct one
            </FormLabel>
            <RadioGroup
              value={selectedValue} // Başlangıçta undefined
              onValueChange={(value) => {
                handleSelection(value);
                form.clearErrors(`questions.${index}.correctAnswer`); // Hata temizleme
              }}
            >
              {fields.map((field, i) => {
                const characterCount = field.answer?.length || 0;
                const isOverLimit = characterCount > 200;
                const hasTrashIcon = fields.length > 2;

                return (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`questions.${index}.answers.${i}.answer`}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <div className="relative">
                          <Input
                            placeholder={`Enter the ${i + 1}. option`}
                            maxLength={200}
                            {...inputField}
                            onChange={(e) => {
                              inputField.onChange(e);
                            }}
                            className={cn(
                              radioField.value === i.toString() &&
                                "rounded-2xl border border-brand-primary-400 bg-brand-primary-50 ring-0",
                              questionType === "tf" && "cursor-pointer",
                              isOverLimit
                                ? "rounded-2xl border-ui-error-500 focus:ring-ui-error-500"
                                : "",
                              "gap-4 pl-12 pr-32 py-6"
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
                              <RadioGroupItem
                                value={i.toString()}
                                checked={radioField.value === i.toString()}
                              />
                            }
                            endElement={
                              hasTrashIcon && (
                                <Button size="icon-sm" variant="ghost" onClick={() => remove(i)}>
                                  <TrashIcon className="size-4" />
                                </Button>
                              )
                            }
                          />
                          {questionType !== "tf" && (
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 ${
                                hasTrashIcon ? "right-10" : "right-4"
                              } text-sm bg-transparent px-1 z-10 ${
                                isOverLimit ? "text-red-500" : "text-greyscale-light-500"
                              }`}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </RadioGroup>
          </FormItem>
        )}
      />
      <FormMessage>{form.formState.errors?.questions?.[index]?.correctAnswer?.message}</FormMessage>

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
    <Card className="flex-1 flex flex-col overflow-y-auto">
      <CardHeader>
      <Button 
        onClick={() => {}}
        variant="default"
        className="flex items-center justify-center stroke-current text-3xl align-middle cursor-pointer hover:bg-brand-primary-400"
        size="icon" pill>
       ☺︎
      </Button>
        <CardHeaderContent>
          <CardTitle>Let’s create your questions!</CardTitle>
          <CardDescription>
            Create questions that inspire, challenge, and engage participants for a truly
            interactive experience.
          </CardDescription>
        </CardHeaderContent>
        <SaveAsDraftButton />
        <Button size="icon" onClick={onNext} pill>
          <ArrowRightIcon className="size-6" />
        </Button>
      </CardHeader>

      <CardContent className="flex overflow-y-auto flex-1 gap-6 flex-col md:flex-row relative p-5">
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
                    <SelectContent className="z-50">
                      <SelectItem className="py-3 px-4" value="mc">
                        Multiple choice
                      </SelectItem>
                      <SelectItem className="py-3 px-4" value="tf">
                        True/False
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="ord">
                        Ordering (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="ma">
                        Matching (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="sa">
                        Likert (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="ps">
                        Poll/Survey (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="dd">
                        Drag and Drop (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="vb">
                        Video based (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="ib">
                        Image based (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="ess">
                        Essay (soon)
                      </SelectItem>
                      <SelectItem disabled className="py-3 px-4" value="fill">
                        Fill in the blank (soon)
                      </SelectItem>
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
                  <FormLabel className="flex gap-2 items-center rounded-full">
                    Enter the question below. You can use the markdown editor to customize it ☺︎
                  </FormLabel>
                  <FormControl>
                    <div className="border border-greyscale-light-200 rounded-2xl min-h-[240px] max-h-[240px] bg-base-white ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-400">
                      <MarkdownEditor
                        className="mdxeditor"
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
            <Answers index={activeQuestionIndex} />
          </div>
        </div>

        <Card>
          <CardHeader className="px-5 min-h-[68px] max-h-[68px]">Questions List</CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto mb-4">
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
              size="default"
              icon={true}
              iconPosition="right"
              className="border-2 border-brand-primary-950 hover:bg-brand-primary-200"
              onClick={() => {
                append({
                  question: "",
                  correctAnswer: "",
                  answers: [{ answer: "" }, { answer: "" }],
                  questionType: "mc",
                });
                setActiveQuestionIndex(fields.length);
              }}
            >
              <span className="hidden md:block">Add question</span>{" "}
              <PlusIcon className="size-5 h-5 w-5 stroke-current" />
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};
