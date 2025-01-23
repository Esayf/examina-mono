import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const step1ValidationSchema = z.object({
  questions: z.array(
    z.object({
      question: z
        .string()
        .min(3, { message: "Question must be at least 3 characters." })
        .max(200, { message: "Question cannot exceed 200 characters." }),
      correctAnswer: z.string().min(1, { message: "A correct answer must be selected." }),
      answers: z
        .array(
          z.object({
            answer: z
              .string()
              .min(1, {
                message: "Answer option cannot be empty. Please enter some text.",
              })
              .max(200, {
                message: "Answer cannot exceed 200 characters.",
              }),
          })
        )
        .min(2, { message: "You must have at least 2 answers." }),
      questionType: z.enum(["mc", "tf"], {
        errorMap: () => ({ message: "Invalid question type." }),
      }),
      media: z.any().nullable(),
    })
  ),
});

export type Step1FormValues = z.infer<typeof step1ValidationSchema>;

/**
 * useStep1Form
 * Form'u context üzerinden yönetebilmek için yardımcı bir kancadır (hook).
 * Bu, step1 form değerlerine kolaylıkla erişmemizi sağlar.
 */
export const useStep1Form = () => useFormContext<Step1FormValues>();
