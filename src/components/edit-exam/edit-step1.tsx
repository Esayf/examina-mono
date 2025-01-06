import { useFieldArray, useForm } from "react-hook-form";
import { step1ValidationSchema, useStep1Form } from "./step1-schema";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "./markdown";
import { useEffect, useRef, useState } from "react";
import { useStep1Form } from "../create-exam/step1-schema";

import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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

interface Step1Props {
  onNext: () => void;
}

export const EditStep1: React.FC<Step1Props> = ({ onNext }) => {
  const {
    control,
    formState: { errors },
  } = useStep1Form();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const activeQuestion = fields[activeQuestionIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Questions</h1>
        <SaveAsDraftButton />
      </div>

      <FormField
        control={control}
        name={`questions.${activeQuestionIndex}.question`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question</FormLabel>
            <FormControl>
              <MarkdownEditor
                markdown={field.value}
                onChange={field.onChange}
                className="border border-gray-300 rounded-lg p-4"
              />
            </FormControl>
            <FormMessage>{errors?.questions?.[activeQuestionIndex]?.question?.message}</FormMessage>
          </FormItem>
        )}
      />

      <div>
        <h2 className="text-lg font-semibold">Answer Options</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <Input
              placeholder={`Option ${index + 1}`}
              {...field}
              maxLength={200}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => remove(index)}
              disabled={fields.length <= 2}
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => append({ answer: "" })}
          className="mt-2"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Add Option
        </Button>
      </div>

      <div className="flex justify-between mt-4">
        <Button
          variant="default"
          disabled={activeQuestionIndex === 0}
          onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Button variant="default" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
