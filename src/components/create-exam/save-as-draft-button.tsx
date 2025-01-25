import React from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveDraftError, saveDraftExam, updateDraftExam } from "@/lib/Client/Exam";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";
import { AxiosError } from "axios";

export const SaveAsDraftButton = () => {
  const router = useRouter();
  const examId = router.query.examId as string | undefined;
  const queryClient = useQueryClient();

  // Use raw form context instead of validated form hooks
  const { getValues: getStep1Values } = useFormContext();
  const { getValues: getStep2Values } = useFormContext();

  const { mutate, isPending } = useMutation({
    mutationFn: examId ? updateDraftExam : saveDraftExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["draftExams"] });
      queryClient.invalidateQueries({ queryKey: ["draft", examId] });

      router.replace("/app/dashboard/created");
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
    // Get raw form values without validation
    const step1Values = getStep1Values();
    const step2Values = getStep2Values();

    mutate({
      ...(examId ? { id: examId } : ({} as { id: string })),
      ...step1Values,
      ...step2Values,
      title: step2Values.title || "Untitled",
      startDate: step2Values.startDate ? new Date(step2Values.startDate).toISOString() : undefined,
      duration: step2Values.duration ? parseInt(step2Values.duration) : undefined,
      questions:
        step1Values.questions?.map((question: any, i: number) => ({
          number: i + 1,
          text: question.question || "",
          description: question.question || "",
          options:
            question.answers?.map((answer: any, i: number) => ({
              number: i + 1,
              text: answer.answer || "",
            })) || [],
          correctAnswer: question.correctAnswer ? parseInt(question.correctAnswer) : undefined,
          questionType: question.questionType,
        })) || [],
    });
  };

  return (
    <Button variant="ghost" className="w-40" disabled={isPending} pill onClick={handleSave}>
      {isPending ? <Spinner className="size-6" /> : "Save as Draft"}
    </Button>
  );
};
