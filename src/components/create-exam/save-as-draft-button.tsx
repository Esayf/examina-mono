import React from "react";

import { Button } from "@/components/ui/button";
import { useStep2Form } from "./step2-schema";
import { useMutation } from "@tanstack/react-query";
import { SaveDraftError, saveDraftExam, updateDraftExam } from "@/lib/Client/Exam";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useStep1Form } from "./step1-schema";
import { Spinner } from "../ui/spinner";
import { AxiosError } from "axios";

export const SaveAsDraftButton = () => {
  const router = useRouter();
  const examId = router.query.examId as string | undefined;

  const { getValues: getStep1Values } = useStep1Form();
  const { getValues: getStep2Values } = useStep2Form();

  const { mutate, isPending } = useMutation({
    mutationFn: examId ? updateDraftExam : saveDraftExam,
    onSuccess: () => {
      router.replace("/app");
      toast.success("Saved the draft. You can continue editing it later.");
    },
    onError: (error: AxiosError<SaveDraftError>) => {
      console.error(error);

      if (!error.isAxiosError || !error.response) {
        toast.error("Failed to save the draft. Please try again.");
        return;
      }

      if (error.response) toast.error(error.response?.data.errors.map((e) => e.message).join("\n"));
    },
  });

  const handleSave = async () => {
    const step1Values = getStep1Values();
    const step2Values = getStep2Values();

    mutate({
      ...(examId ? { id: examId } : ({} as { id: string })),
      ...step1Values,
      ...step2Values,
      startDate: step2Values.startDate ? step2Values.startDate.toISOString() : undefined,
      duration: step2Values.duration ? parseInt(step2Values.duration) : undefined,
      questions:
        step1Values.questions && step1Values.questions.length > 0
          ? step1Values.questions.map((question, i) => ({
              type: question.questionType,
              number: i + 1,
              text: question.question,
              description: question.question,
              options: question.answers.map((answer, i) => ({
                number: i + 1,
                text: answer.answer,
              })),
              correctAnswer: parseInt(question.correctAnswer) + 1,
            }))
          : undefined,
    });
  };

  return (
    <Button 
    variant="ghost" 
    className="w-40" 
    disabled={isPending} 
    pill 
    onClick={handleSave}>
      {isPending ? <Spinner className="size-6" /> : "Save as Draft"}
    </Button>
  );
};
