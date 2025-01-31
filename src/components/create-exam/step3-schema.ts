import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod tabanlı şema
export const step3ZodSchema = z.object({
  quizIntroBackground: z.string().nonempty("Please select an intro background"),
  liveQuizBackground: z.string().nonempty("Please select a live quiz background"),
});

// TypeScript tipi otomatik olarak Zod'dan türetilir
export type Step3FormValues = z.infer<typeof step3ZodSchema>;

export function useStep3Form() {
  return useForm<Step3FormValues>({
    resolver: zodResolver(step3ZodSchema),
    defaultValues: {
      quizIntroBackground: "",
      liveQuizBackground: "",
    },
    mode: "onChange",
  });
}
