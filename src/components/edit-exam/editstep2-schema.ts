import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const editStep2ValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  duration: z
    .number({ invalid_type_error: "Duration must be a number" })
    .min(1, "Duration must be at least 1 minute"),
  rewardDistribution: z.boolean(),
});

export type EditStep2FormValues = z.infer<typeof editStep2ValidationSchema>;
