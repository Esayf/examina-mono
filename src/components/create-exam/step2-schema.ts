import { useFormContext } from "react-hook-form";
import { z } from "zod";

const looseOptional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value: unknown) =>
      value === null || (typeof value === "string" && value === "") ? undefined : value,
    schema.optional()
  );

export const step2ValidationSchema = z
  .object({
    title: z.string().min(3, "Quiz title must be at least 3 characters."),
    description: z.string().min(3, "Quiz description must be at least 3 characters."),
    startDate: z.date().refine((value) => {
      return value >= new Date(Date.now() + 5 * 60 * 1000 - 59000);
    }, "Start date should be at least 5 minutes from now."),
    duration: z.string(),
    rewardDistribution: z.boolean(),
    // the rest of the fields are only required if the reward distribution is activated
    minimumPassingScore: looseOptional(
      z
        .number()
        .min(0, "Minimum passing score must be at least 0")
        .max(100, "Minimum passing score must be at most 100")
    ),
    totalRewardPoolAmount: z.preprocess((value) => {
      if (!value) return undefined; // Null, boş string veya undefined ise geri dön
      return Number(value);
    }, z.number().min(0, "Total reward pool must be at least 0").optional()),

    //rewardType: z.enum(["Monetary (MINA Token)", "NFT (Coming soon)", "Custom (Coming soon)"]),

    rewardPerWinner: z.preprocess((value) => {
      if (
        value === null ||
        (typeof value === "string" && value === "") ||
        typeof value === "undefined"
      )
        return undefined;
      return Number(z.string().parse(value));
    }, z.number().min(0, "Reward amount must be at least 0").optional()),
  })
  .superRefine((values, context) => {
    if (values.rewardDistribution) {
      if (!values.minimumPassingScore) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum passing score is required",
          path: ["minimumPassingScore"],
        });
      }
      if (!values.totalRewardPoolAmount) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total reward pool is required",
          path: ["totalRewardPoolAmount"],
        });
      }
      if (!values.rewardPerWinner) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reward amount is required",
          path: ["rewardPerWinner"],
        });
      }

      // Mantıksal kontrol: Reward per winner > total pool
      if (
        values.rewardPerWinner &&
        values.totalRewardPoolAmount &&
        values.rewardPerWinner > values.totalRewardPoolAmount
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reward per winner cannot exceed the total reward pool.",
          path: ["rewardPerWinner"],
        });
      }
    }
  });

export type Step2FormValues = z.infer<typeof step2ValidationSchema>;

export const useStep2Form = () => useFormContext<Step2FormValues>();
