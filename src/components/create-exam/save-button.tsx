import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { PaperAirplaneIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
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
  startDate: string;
  duration: string;
  totalRewardPoolAmount: string;
  rewardPerWinner: string;
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
    onSuccess: (data: { id: string }) => {
      router.replace(`/app/exams/edit/${data.id}`);
      toast.success("Sınav başarıyla güncellendi");
    },
  });

  const handleSave = async () => {
    setIsPublishing(true);
    try {
      const isValid = await form.trigger();
      const step1Values = getStep1Values();
      const step2Values = form.getValues();

      if (!isValid) {
        toast.error("Lütfen tüm gerekli alanları doldurun");
        return;
      }

      const examId = router.query.id as string;

      const existingContractAddress = (step2Values as any).contractAddress;
      let deployJobId = (step2Values as any).deployJobId;

      if (existingContractAddress) {
        await saveExam({
          id: examId,
          title: step2Values.title,
          description: step2Values.description,
          startDate: step2Values.startDate,
          duration: step2Values.duration,
          questions: step1Values.questions.map((question, i) => ({
            questionType: question.questionType,
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
          isRewarded: step2Values.rewardDistribution,
          rewardPerWinner: step2Values.rewardPerWinner || 0,
          passingScore: step2Values.passingScore || 0,
          contractAddress: existingContractAddress,
          deployJobId,
        });
      } else {
        const randomValues = new Uint8Array(32);
        self.crypto.getRandomValues(randomValues);
        const secretKey = Array.from(randomValues, (byte) =>
          byte.toString(16).padStart(2, "0")
        ).join("");

        const deployTx = await buildDeployTx(session.session.walletAddress, {
          startDate: step2Values.startDate.getTime().toString(),
          duration: step2Values.duration,
          secretKey,
          totalRewardPoolAmount: step2Values.totalRewardPoolAmount
            ? parseMina(step2Values.totalRewardPoolAmount).toString()
            : "0",
          rewardPerWinner: step2Values.rewardPerWinner
            ? parseMina(step2Values.rewardPerWinner).toString()
            : "0",
        });

        const signedData = await window.mina?.sendTransaction(deployTx.mina_signer_payload);

        const txStatus = await deployQuiz({
          ...deployTx,
          signedData: signedData.signedData,
          secretKey,
          startDate: deployTx.startDate,
          duration: deployTx.duration,
          totalRewardPoolAmount: deployTx.totalRewardPoolAmount,
          rewardPerWinner: deployTx.rewardPerWinner,
        });

        deployJobId = txStatus.tx.jobId;

        await saveExam({
          id: examId,
          title: step2Values.title,
          description: step2Values.description,
          startDate: step2Values.startDate,
          duration: step2Values.duration,
          questions: step1Values.questions.map((question, i) => ({
            questionType: question.questionType,
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
          isRewarded: step2Values.rewardDistribution,
          rewardPerWinner: step2Values.rewardPerWinner || 0,
          passingScore: step2Values.passingScore || 0,
          contractAddress: deployTx.contractAddress,
          deployJobId,
        });
      }

      toast.success("Değişiklikler kaydedildi!");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      toast.error(error.message || "Değişiklikler kaydedilirken hata oluştu");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Button variant="outline" disabled={isPublishing} pill onClick={handleSave}>
      {isPublishing ? <Spinner className="size-6" /> : <>Publish</>}
    </Button>
  );
};
