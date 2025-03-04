import { useEffect, useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldArray, useForm } from "react-hook-form";
import { step1ValidationSchema, useStep1Form } from "./step1-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { MarkdownEditor } from "./markdown";

interface AnswersProps {
  index: number;
}

export const Answers = ({ index }: AnswersProps) => {
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

  const correctAnswerForm = useForm({
    defaultValues: { correctAnswer: "" },
    resolver: zodResolver(step1ValidationSchema),
  });

  const questionType = form.watch(`questions.${index}.questionType`);
  const prevQuestionType = useRef(questionType);

  const [recentlyAddedIndex, setRecentlyAddedIndex] = useState<number | null>(null);

  // TF => [True,False], MC => ["",""]
  useEffect(() => {
    if (questionType === prevQuestionType.current) return;

    if (questionType === "tf") {
      replace([{ answer: "True" }, { answer: "False" }]);
    } else if (questionType === "mc") {
      replace([{ answer: "" }, { answer: "" }]);
    }

    prevQuestionType.current = questionType;
  }, [questionType, replace]);

  // highlight newly changed question
  useEffect(() => {
    const subscription = form.watch((_, { name, type }) => {
      if (name?.startsWith("questions") && type === "change") {
        const currentIndex = parseInt(name.split(".")[1], 10);
        setRecentlyAddedIndex(currentIndex);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

            {/* 
        True/False => "flex flex-row"
        Multiple Choice => "flex flex-col"
      */}
            <RadioGroup
              className={
                questionType === "tf"
                  ? "flex flex-row gap-4 items-center" // Yatay dizilim
                  : "flex flex-col gap-1" // Dikey dizilim
              }
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

                const isTrueOption = field.answer === "True";
                const isFalseOption = field.answer === "False";
                const isSelected = radioField.value === i.toString();

                // True/False color classes
                let tfColorClass = "";
                if (questionType === "tf" && isTrueOption) {
                  tfColorClass = isSelected
                    ? "bg-green-100 border-green-400 text-green-800 hover:bg-green-200"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
                } else if (questionType === "tf" && isFalseOption) {
                  tfColorClass = isSelected
                    ? "bg-red-100 border-red-400 text-red-800 hover:bg-red-200"
                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
                }

                // Non-TF selected color classes
                const isNonTFSelected =
                  questionType !== "tf" && isSelected
                    ? "border-brand-primary-400 bg-brand-primary-50 ring-0"
                    : "";

                return (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`questions.${index}.answers.${i}.answer`}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <div className="relative">
                          <div
                            onClick={() => {
                              // For True/False, clicking anywhere inside should select the radio
                              if (questionType === "tf") {
                                radioField.onChange(i.toString());
                                handleSelection(i.toString());
                                form.setValue(`questions.${index}.correctAnswer`, i.toString());
                              }
                            }}
                            className={cn(
                              "gap-4 pl-12 pr-32 py-6 rounded-2xl border transition-colors duration-200",
                              questionType === "tf" && tfColorClass,
                              isNonTFSelected,
                              questionType === "tf" && "cursor-pointer",
                              isOverLimit && "border-ui-error-500 focus:ring-ui-error-500"
                            )}
                          >
                            {/* Radio selection item */}
                            <RadioGroupItem value={i.toString()} checked={isSelected} />

                            {/* Our Markdown Editor for the answer text */}
                            <div
                              className={cn(
                                "ml-2 w-full min-h-[4rem] max-h-[20rem] overflow-y-auto focus:outline-none",
                                // Additional styling if needed:
                                "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-800"
                              )}
                            >
                              <MarkdownEditor
                                className="mdxeditor w-full h-full"
                                markdown={inputField.value}
                                onChange={(val) => {
                                  // If TF is read-only, we can skip updating text or keep it if you allow changes
                                  if (questionType !== "tf") {
                                    inputField.onChange(val);
                                  }
                                }}
                                contentEditableClassName="contentEditable"
                                placeholder={`Enter the ${i + 1} option`}
                                readOnly={questionType === "tf"}
                              />
                            </div>

                            {/* Conditional Trash Icon */}
                            {hasTrashIcon && (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                                onClick={() => remove(i)}
                              >
                                <TrashIcon className="size-4" />
                              </Button>
                            )}
                          </div>

                          {/* Character count (Non-TF only) */}
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

                          {isOverLimit && (
                            <p className="text-red-500 text-sm mt-1">
                              The answer option exceeds the maximum allowed 200 characters.
                            </p>
                          )}
                          <FormMessage />
                        </div>
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

      {/* "mc" tipinde max 4 adet option */}
      {form.watch(`questions.${index}.questionType`) === "mc" && fields.length < 4 && (
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
