import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { useStep2Form } from "./step2-schema";
import { useStep1Form } from "./step1-schema";
import { useMutation } from "@tanstack/react-query";
import { createExam } from "@/lib/Client/Exam";
import { v4 } from "uuid";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";
import { Modal } from "@/components/ui/modal";
import { useAppSelector } from "@/app/hooks";
import { SendTransactionArgs, SignedAuroData, SignedPalladData } from "../../../types/global";

/**
 * The PublishButton component orchestrates the final step of creating a quiz:
 * displaying a helpful confirmation modal and actually saving/deploying the quiz data.
 *
 * - If the user confirms, we run `handlePublish()` to finalize everything.
 * - If the user wants to make changes, they can return to editing.
 */

// Keep the BuildQuizArgs and DeployQuizArgs interfaces from save-button.tsx
interface BuildQuizArgs {
  secretKey: string;
  startDate: string;
  duration: string;
  totalRewardPoolAmount: string;
  rewardPerWinner: string;
}

interface DeployQuizArgs {
  contractAddress: string;
  serializedTransaction: string;
  signedData: string;
  secretKey: string;
  startDate: string;
  duration: string;
  totalRewardPoolAmount: string;
  rewardPerWinner: string;
}

// Keep the helper functions from save-button.tsx
async function buildDeployTx(sender: string, args: BuildQuizArgs) {
  const result = await fetch("/api/buildDeployTx", {
    method: "POST",
    body: JSON.stringify({
      sender: sender,
      args: {
        startDate: args.startDate,
        duration: args.duration,
        secretKey: args.secretKey,
        totalRewardPoolAmount: args.totalRewardPoolAmount,
        rewardPerWinner: args.rewardPerWinner,
      } satisfies BuildQuizArgs,
    }),
  });
  return result.json();
}

async function deployQuiz(args: DeployQuizArgs) {
  const result = await fetch("/api/deployQuiz", {
    method: "POST",
    body: JSON.stringify({ args }),
  });
  return result.json();
}

function parseMina(amount: string | number) {
  return Number(amount.toString()) * 1000000000;
}

interface PublishButtonProps {
  onPublishStart: () => void;
}

export const PublishButton = ({ onPublishStart }: PublishButtonProps) => {
  const session = useAppSelector((state) => state.session);
  const router = useRouter();
  const form = useStep2Form();
  const { getValues: getStep1Values } = useStep1Form();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { mutateAsync: saveExam } = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      form.reset(form.getValues(), { keepDirty: false, keepIsSubmitted: true, keepValues: true });
      router.replace("/app/dashboard/created");
      toast.success("Quiz created successfully!");
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to create exam");
    },
  });

  const handlePublish = async () => {
    setIsPublishing(true);
    onPublishStart();
    const isValid = await form.trigger();
    const step1Values = getStep1Values();
    const step2Values = form.getValues();

    if (isValid) {
      try {
        let contractAddressNullable = " ";
        let txStatus = { tx: { success: false, jobId: "" } };
        const totalRewardPoolAmount = step2Values.totalRewardPoolAmount
          ? parseMina(step2Values.totalRewardPoolAmount)
          : undefined;
        const rewardPerWinner = step2Values.rewardPerWinner
          ? parseMina(step2Values.rewardPerWinner)
          : undefined;

        const isRewardDistributionEnabled =
          step2Values.rewardDistribution && !!totalRewardPoolAmount && !!rewardPerWinner;

        if (isRewardDistributionEnabled) {
          const randomValues = new Uint8Array(1);
          self.crypto.getRandomValues(randomValues);
          const secretKey = randomValues[0].toString();

          const deployTx = await buildDeployTx(session.session.walletAddress, {
            startDate: step2Values.startDate.getTime().toString(),
            duration: step2Values.duration,
            secretKey,
            totalRewardPoolAmount: totalRewardPoolAmount.toString(),
            rewardPerWinner: rewardPerWinner.toString(),
          });

          if (!("mina_signer_payload" in deployTx)) {
            toast.error("Failed to create exam. Could not build deploy transaction");
            setIsPublishing(false);
            return;
          }

          const { mina_signer_payload, serializedTransaction, contractAddress } = deployTx;

          const signedAuroData = window.mina?.isPallad
            ? ((
                await window?.mina?.request({
                  method: "mina_signTransaction",
                  params: { transaction: JSON.parse(mina_signer_payload.transaction as string) },
                })
              ).result as SignedPalladData)
            : await window?.mina?.sendTransaction(mina_signer_payload);

          if (window.mina?.isAuro) {
            if (!(typeof signedAuroData === "object" && "signedData" in signedAuroData)) {
              toast.error("You need to sign the transaction to deploy the quiz");
              setIsPublishing(false);
              return;
            }
          }

          let signedData = window.mina?.isAuro
            ? (signedAuroData as SignedAuroData).signedData
            : (signedAuroData as SignedPalladData).data;

          txStatus = await deployQuiz({
            contractAddress,
            serializedTransaction,
            signedData,
            secretKey,
            startDate: step2Values.startDate.getTime().toString(),
            duration: step2Values.duration,
            ...(isRewardDistributionEnabled && {
              totalRewardPoolAmount: totalRewardPoolAmount.toString(),
              rewardPerWinner: rewardPerWinner.toString(),
            }),
          });
          contractAddressNullable = contractAddress;
        }

        await saveExam({
          id: v4(),
          title: step2Values.title,
          description: step2Values.description,
          startDate: step2Values.startDate,
          duration: step2Values.duration,
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
          isRewarded: isRewardDistributionEnabled,
          ...(isRewardDistributionEnabled && {
            totalRewardPoolAmount: totalRewardPoolAmount.toString(),
            rewardPerWinner: rewardPerWinner || 0,
            passingScore: step2Values.passingScore || 0,
            contractAddress: contractAddressNullable,
            deployJobId: txStatus.tx.jobId,
          }),
        });
      } catch (error) {
        toast.error("Failed to create exam");
      } finally {
        setIsPublishing(false);
        setIsConfirmModalOpen(false);
      }
    } else {
      setIsPublishing(false);
    }
  };

  /**
   * Validates the form and, if everything is fine,
   * opens up our friendly confirmation modal.
   */
  const handleOpenConfirmModal = async () => {
    try {
      const isValid = await form.trigger(undefined, { shouldFocus: true });
      if (!isValid) {
        const errors = form.formState.errors;
        console.log("Form validation errors:", errors); // Debug log
        toast.error("Please fix the form errors before publishing");
        return;
      }
      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Form validation failed");
    }
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
        className={`group relative inline-flex items-center justify-center px-5 py-3 font-medium text-brand-secondary-200 rounded-full bg-brand-primary-900 z-50
                   transform-gpu
                   transition-all duration-300 ease-out
                   hover:-translate-y-0.5
                   hover:scale-105
                   active:scale-95
                   active:translate-y-0
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
