import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const step1ValidationSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(3, { message: "Question must be at least 3 characters long" }),
        correctAnswer: z.string().min(1, { message: "Correct answer is required" }),
        answers: z
          .array(
            z.object({
              answer: z.string().min(1, { message: "Answer is required" }).max(200),
            })
          )
          .min(2),
        questionType: z.enum(["mc", "tf"]),
      })
    )
    .min(1),
});

export type Step1FormValues = z.infer<typeof step1ValidationSchema>;

export const useStep1Form = () => useFormContext<Step1FormValues>();
