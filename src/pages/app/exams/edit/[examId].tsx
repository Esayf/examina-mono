import React, { useState } from "react";
import Head from "next/head";
import DashboardHeader from "@/components/ui/dashboard-header";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Step2FormValues, step2ValidationSchema } from "@/components/create-exam/step2-schema";
import { Step1FormValues, step1ValidationSchema } from "@/components/create-exam/step1-schema";
import { Step2 } from "@/components/create-exam/step2";
import { Step1 } from "@/components/create-exam/step1";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Exam, getDraftExam } from "@/lib/Client/Exam";
import { Spinner } from "@/components/ui/spinner";

type FormValues = Step1FormValues | Step2FormValues;

const validationSchema = [step1ValidationSchema, step2ValidationSchema] as const;

interface ExamFormProps {
  exam?: Exam;
}

const EMPTY_QUESTION = [
  {
    question: "",
    correctAnswer: "",
    questionType: "mc" as const,
    answers: [
      {
        answer: "",
      },
      {
        answer: "",
      },
    ],
  },
];

function ExamForm({ exam }: ExamFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const currentValidationSchema = validationSchema[currentStep];

  const methods = useForm<FormValues>({
    shouldUnregister: false,
    resolver: zodResolver(currentValidationSchema),
    mode: "onChange",
    defaultValues: exam
      ? {
          title: exam.title,
          description: exam.description,
          duration: exam.duration ? exam.duration.toString() : undefined,
          rewardDistribution: exam.isRewarded,
          questions: EMPTY_QUESTION,
        }
      : {
          title: "",
          rewardDistribution: false,
          questions: EMPTY_QUESTION,
        },
  });

  const { trigger } = methods;

  const handleNext = async () => {
    const isStepValid = await trigger(undefined, {
      shouldFocus: true,
    });
    if (isStepValid) setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  return (
    <div className="h-dvh flex flex-col">
      <Head>
        <title>Create new quiz | Choz </title>
      </Head>
      <DashboardHeader withoutNav={false} withoutTabs={true} />
      <div className="sm:px-4 lg:px-8 h-full flex flex-col overflow-hidden">
        <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 pt-8 flex-1 overflow-hidden">
          <FormProvider {...methods}>
            {currentStep === 0 && <Step1 onNext={handleNext} />}
            {currentStep === 1 && <Step2 onBack={handleBack} />}
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

const EditExam = () => {
  const router = useRouter();
  const examId = router.query.examId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["draft", examId],
    queryFn: () => getDraftExam(examId),
    enabled: !!examId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-12" />
      </div>
    );
  }

  return <ExamForm exam={data} />;
};

export default EditExam;