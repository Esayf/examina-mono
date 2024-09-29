import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string().url(),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
});

export type Environment = z.infer<typeof publicEnvSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof publicEnvSchema> {}
  }
}
