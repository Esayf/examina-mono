import React from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateDraftInput,
  DraftExam,
  SaveDraftError,
  saveDraftExam,
  updateDraftExam,
} from "@/lib/Client/Exam";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";
import { AxiosError } from "axios";

export const SaveAsDraftButton = () => {
  const router = useRouter();
  const examId = router.query.examId as string | undefined;
  const queryClient = useQueryClient();
  const form = useFormContext(); // Get full form context
  const { mutate, isPending } = useMutation<
    DraftExam,
    AxiosError<SaveDraftError>,
    CreateDraftInput & { id?: string }
  >({
    mutationFn: (draft) =>
      examId ? updateDraftExam({ ...draft, id: examId }) : saveDraftExam(draft),
    onSuccess: (data: DraftExam) => {
      // Reset form state to mark as "submitted" but keep current values
      form.reset(form.getValues(), { keepDirty: false, keepIsSubmitted: true });

      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["draftExams"] });
      queryClient.invalidateQueries({ queryKey: ["draft", examId] });

      toast.success("Draft saved successfully. You can continue editing.");

      // Update URL if new draft created
      if (!examId && data?._id) {
        router.replace(`/app/exams/edit/${data._id}`, undefined, { shallow: true });
      }
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
    // Get raw unvalidated values
    const values = form.getValues();

    mutate({
      ...(examId ? { id: examId } : ({} as { id: string })),
      ...values,
      title: values.title || "Untitled",
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      duration: values.duration ? parseInt(values.duration) : undefined,
      questions:
        values.questions?.map((question: any, i: number) => ({
          number: i + 1,
          text: question.question || undefined,
          description: question.question || undefined,
          options:
            question.answers?.map((answer: any, i: number) => ({
              number: i + 1,
              text: answer.answer || undefined,
            })) || [],
          correctAnswer: question.correctAnswer ? parseInt(question.correctAnswer) : undefined,
          questionType: question.questionType,
        })) || [],
    });
  };

  return (
    <Button
      variant="ghost"
      className="w-40"
      disabled={isPending || !form.formState.isDirty}
      pill
      onClick={handleSave}
    >
      {isPending ? <Spinner className="size-6" /> : "Save as Draft"}
    </Button>
  );
};
