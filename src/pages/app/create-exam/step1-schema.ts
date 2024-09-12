import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const step1ValidationSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  startDate: z.date(),
  duration: z.string(),
});

export type Step1FormValues = z.infer<typeof step1ValidationSchema>;

export const useStep1Form = () => useFormContext<Step1FormValues>();
