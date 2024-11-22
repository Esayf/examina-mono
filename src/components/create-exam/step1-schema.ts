import { useFormContext } from "react-hook-form";
import { z } from "zod";

const looseOptional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value: unknown) =>
      value === null || (typeof value === "string" && value === "") ? undefined : value,
    schema.optional()
  );

export const step1ValidationSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    startDate: z.date(),
    duration: z.string(),
    rewardDistribution: z.boolean(),
    // the rest of the fields are only required if the reward distribution is activated
    distributionWay: looseOptional(z.union([z.literal("manual"), z.literal("auto")])),
    rewardType: looseOptional(z.string()),
    minimumPassingScore: looseOptional(
      z
        .number()
        .int()
        .min(0, "Minimum passing score must be at least 0")
        .max(100, "Minimum passing score must be at most 100")
    ),
    totalRewardPool: looseOptional(z.number().min(0, "Total reward pool must be at least 0")),
    rewardAmount: looseOptional(z.number().min(0, "Reward amount must be at least 0")),
  })
  .superRefine((values, context) => {
    if (values.rewardDistribution) {
      if (!values.distributionWay) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Distribution way is required",
          path: ["distributionWay"],
        });
      }
      if (!values.rewardType) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reward type is required",
          path: ["rewardType"],
        });
      }
      if (!values.minimumPassingScore) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum passing score is required",
          path: ["minimumPassingScore"],
        });
      }
      if (!values.totalRewardPool) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total reward pool is required",
          path: ["totalRewardPool"],
        });
      }
      if (!values.rewardAmount) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reward amount is required",
          path: ["rewardAmount"],
        });
      }
    }
  });

export type Step1FormValues = z.infer<typeof step1ValidationSchema>;

export const useStep1Form = () => useFormContext<Step1FormValues>();
