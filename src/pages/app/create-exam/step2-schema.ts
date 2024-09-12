import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const step2ValidationSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(3, { message: "Question must be at least 3 characters long" }),
        correctAnswer: z.string().min(1),
        answers: z
          .array(
            z.object({
              answer: z.string().min(3, { message: "Answer must be at least 3 characters long" }),
            })
          )
          .min(2),
        questionType: z.enum(["mc", "tf"]),
      })
    )
    .min(1),
});

export type Step2FormValues = z.infer<typeof step2ValidationSchema>;

export const useStep2Form = () => useFormContext<Step2FormValues>();
