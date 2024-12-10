import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useStep2Form } from "./step2-schema";
import { v4 } from "uuid";
import { useMutation } from "@tanstack/react-query";
import { createExam } from "@/lib/Client/Exam";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { SendTransactionArgs, SignedAuroData, SignedPalladData } from "../../../types/global";
import { useStep1Form } from "./step1-schema";
import { useAppSelector } from "@/app/hooks";
import { Spinner } from "../ui/spinner";

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

async function buildDeployTx(
  sender: string,
  args: BuildQuizArgs
): Promise<{
  mina_signer_payload: SendTransactionArgs;
  serializedTransaction: string;
  contractAddress: string;
  nonce: number;
}> {
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

async function deployQuiz(
  args: DeployQuizArgs
): Promise<{ tx: { success: boolean; jobId: string } }> {
  const result = await fetch("/api/deployQuiz", {
    method: "POST",
    body: JSON.stringify({ args }),
  });
  return result.json();
}

function parseMina(amount: string | number) {
  return Number(amount.toString()) * 1000000000;
}

export const PublishButton = () => {
  const session = useAppSelector((state) => state.session);
  const { getValues: getStep1Values } = useStep1Form();
  const form = useStep2Form();
  const router = useRouter();

  const [isPublishing, setIsPublishing] = useState(false);

  const { mutateAsync: saveExam } = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      router.replace("/app");
      toast.success("Exam created successfully");
    },
    onError: (error) => {
      console.log("Error", error);
      toast.error("Failed to create exam");
    },
  });

  const handlePublish = async () => {
    setIsPublishing(true); // Set publishing state to true
    const isValid = await form.trigger(undefined, { shouldFocus: true });
    const step1Values = getStep1Values();
    const step2Values = form.getValues();

    if (isValid) {
      try {
        let contractAddressNullable = "";
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

          const { mina_signer_payload, serializedTransaction, contractAddress, nonce } = deployTx;

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
            options: question.answers.map((answer, i) => ({
              number: i + 1,
              text: answer.answer,
            })),
            correctAnswer: parseInt(question.correctAnswer) + 1,
          })),
          questionCount: step1Values.questions.length,
          isRewarded: isRewardDistributionEnabled,
          rewardPerWinner: rewardPerWinner || 0,
          passingScore: step2Values.minimumPassingScore || 0,
          contractAddress: contractAddressNullable,
          deployJobId: txStatus.tx.jobId === "" ? null : txStatus.tx.jobId,
        });
      } catch (error) {
        toast.error("Failed to create exam");
      } finally {
        setIsPublishing(false);
      }
    } else {
      setIsPublishing(false);
    }
  };

  return (
    <Button
      variant="default"
      size="default"
      icon={true}
      iconPosition="right"
      disabled={isPublishing}
      pill
      onClick={handlePublish}
    >
      {isPublishing ? (
        <Spinner className="size-6" />
      ) : (
        <>
          Publish <PaperAirplaneIcon className="size-6" />
        </>
      )}
    </Button>
  );
};
