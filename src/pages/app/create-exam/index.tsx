import React, { useState } from "react";

import DashboardHeader from "@/components/ui/dashboard-header";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Step2FormValues, step2ValidationSchema } from "@/components/create-exam/step2-schema";
import { Step1FormValues, step1ValidationSchema } from "@/components/create-exam/step1-schema";
import { Step2 } from "@/components/create-exam/step2";
import { Step1 } from "@/components/create-exam/step1";

import Head from "next/head";

type FormValues = Step1FormValues | Step2FormValues;

const validationSchema = [step1ValidationSchema, step2ValidationSchema] as const;

function CreateExam() {
  const [currentStep, setCurrentStep] = useState(0);

  const currentValidationSchema = validationSchema[currentStep];

  const methods = useForm<FormValues>({
    shouldUnregister: false,
    resolver: zodResolver(currentValidationSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      rewardDistribution: false,
      questions: [
        {
          question: "",
          correctAnswer: "0",
          questionType: "mc",
          answers: [
            {
              answer: "",
            },
            {
              answer: "",
            },
          ],
        },
      ],
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
      <DashboardHeader withoutNav />
      <div className="md:px-6 h-full flex flex-col overflow-hidden">
        <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 flex-1 overflow-hidden">
          <Head>
            <title>Create Exam</title>
          </Head>

          <FormProvider {...methods}>
            {currentStep === 0 && <Step1 onNext={handleNext} />}
            {currentStep === 1 && <Step2 onBack={handleBack} />}
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export default CreateExam;
