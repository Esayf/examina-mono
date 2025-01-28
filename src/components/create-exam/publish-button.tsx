import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaperAirplaneIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { useStep2Form } from "./step2-schema";
import { useStep1Form } from "./step1-schema";
import { useMutation } from "@tanstack/react-query";
import { createExam } from "@/lib/Client/Exam";
import { v4 } from "uuid";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";
import { Modal } from "@/components/ui/modal"; // Our friendly, custom modal

/**
 * The PublishButton component orchestrates the final step of creating a quiz:
 * displaying a helpful confirmation modal and actually saving/deploying the quiz data.
 *
 * - If the user confirms, we run `handlePublish()` to finalize everything.
 * - If the user wants to make changes, they can return to editing.
 */
export const PublishButton = () => {
  const router = useRouter();

  // Step2 data (title, desc, startDate, duration, etc.)
  const form = useStep2Form();

  // Step1 data (questions, answers, etc.)
  const { getValues: getStep1Values } = useStep1Form();

  // Keeps track of whether publishing is in progress
  const [isPublishing, setIsPublishing] = useState(false);

  // Controls visibility of the confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Prepares to save the exam in DB/API
  const { mutateAsync: saveExam } = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      // Once successfully saved, navigate away and show a success toast
      router.replace("/app/dashboard/created");
      toast.success("Quiz created successfully!");
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to create exam");
    },
  });

  /**
   * Actually performs the publishing logic:
   * 1) Optionally handle any blockchain deployment.
   * 2) Save the quiz details via `createExam`.
   */
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const step1Values = getStep1Values();
      const step2Values = form.getValues();

      // In case you have more advanced logic (blockchain deploy, etc.), insert it here.

      // Then persist the exam data in your database
      await saveExam({
        id: v4(),
        title: step2Values.title,
        description: step2Values.description,
        startDate: step2Values.startDate,
        duration: step2Values.duration,
        backgroundImage: step2Values.backgroundImage || null,
        questions: step1Values.questions.map((question, i) => ({
          type: question.questionType,
          number: i + 1,
          text: question.question,
          description: question.question,
          options: question.answers.map((answer, j) => ({
            number: j + 1,
            text: answer.answer,
          })),
          correctAnswer: parseInt(question.correctAnswer) + 1,
        })),
        questionCount: step1Values.questions.length,
        isRewarded: step2Values.rewardDistribution,
        rewardPerWinner: step2Values.rewardPerWinner || 0,
        passingScore: step2Values.minimumPassingScore || 0,
        // Provide any default or real values if needed:
        contractAddress: "exampleIfYouHaveOne",
        deployJobId: "someJobIdIfExists",
      });
    } catch (error) {
      toast.error("Failed to create exam");
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Validates the form and, if everything is fine,
   * opens up our friendly confirmation modal.
   */
  const handleOpenConfirmModal = async () => {
    const isValid = await form.trigger(undefined, { shouldFocus: true });
    if (!isValid) return;
    setIsConfirmModalOpen(true);
  };

  /**
   * Closes the modal and proceeds with publishing.
   */
  const handleConfirmPublish = () => {
    setIsConfirmModalOpen(false);
    handlePublish();
  };

  /**
   * Lets the user cancel the modal to keep editing their quiz.
   */
  const handleCancelPublish = () => {
    setIsConfirmModalOpen(false);
  };

  /**
   * Renders a tidy quiz summary for the confirmation modal:
   * - Title, date, duration, question count, reward distribution, etc.
   */
  const renderQuizSummary = () => {
    const step1Values = getStep1Values();
    const step2Values = form.getValues();

    const startDateString = step2Values.startDate ? step2Values.startDate.toLocaleString() : "N/A";

    return (
      <div className="flex flex-col gap-3 text-brand-primary-950 font-normal">
        <div className="mb-1">
          <strong>Title:</strong> {step2Values.title || "No title"}
        </div>
        <div className="mb-1">
          <strong>Start date:</strong> {startDateString}
        </div>
        <div className="mb-1">
          <strong>Duration (minutes):</strong> {step2Values.duration || "N/A"}
        </div>
        <div className="mb-1">
          <strong>Number of questions:</strong> {step1Values.questions?.length || 0}
        </div>
        <div>
          <strong>Reward distribution:</strong>{" "}
          {step2Values.rewardDistribution ? "Enabled" : "Disabled"}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 
        The main Publish button: 
        Summons the modal if the form is valid, or shows 
        a spinner if we're actively publishing.
      */}
      <Button
        onClick={handleOpenConfirmModal}
        disabled={isPublishing}
        className={`
    group
    relative inline-flex items-center justify-center
    px-5 py-3
    font-medium text-brand-secondary-200
    rounded-full
    bg-brand-primary-900
    z-50

    transform-gpu
    transition-all duration-300 ease-out

    /* Hover/Active tepkileri */
    hover:-translate-y-0.5
    hover:scale-105
    active:scale-95
    active:translate-y-0

    /* Gölge */
    shadow-sm
    hover:shadow-md
    active:shadow-sm

    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-offset-2
    focus-visible:ring-brand-primary-800
  `}
      >
        {isPublishing ? (
          <Spinner className="w-6 h-6" />
        ) : (
          <>
            {/* Metin her zaman görünür */}
            <span className="hidden sm:inline">Time to publish!</span>

            {/* Roket ikonu başlangıçta scale-0 (gizli) */}
            <RocketLaunchIcon
              className={`
          w-6 h-6
          sm:ml-2
        `}
            />
          </>
        )}
      </Button>

      {/* 
        The confirmation modal that gives the user a chance 
        to review their quiz details before finalizing.
      */}
      <Modal isOpen={isConfirmModalOpen} onClose={handleCancelPublish} title="Confirm quiz details">
        <div className="text-brand-primary-950 font-normal">
          <p className="mb-4">
            Almost done! 😎 Please review the summary of your quiz before publishing:
          </p>
          {renderQuizSummary()}

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={handleCancelPublish}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleConfirmPublish}>
              Publish now!
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
