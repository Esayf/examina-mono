import React, { useState } from "react";
import Head from "next/head";
import DashboardHeader from "@/components/ui/dashboard-header";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Step2FormValues, step2ValidationSchema } from "@/components/create-exam/step2-schema";
import { Step1FormValues, step1ValidationSchema } from "@/components/create-exam/step1-schema";
import { Step2 } from "@/components/create-exam/step2";
import { Step1 } from "@/components/create-exam/step1";

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
          correctAnswer: "",
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
      <Head>
        <title>Create new quiz | Choz </title>
        <meta
          name="description"
          content="Create engaging quizzes with reward distribution on Choz. Our next-generation quiz platform lets you build interactive assessments with multiple question types."
        />
        <meta
          name="keywords"
          content="create quiz, online quiz, quiz platform, reward distribution, assessment tool, Choz"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Create New Exam | Choz" />
        <meta
          property="og:description"
          content="Create engaging exams with reward distribution on Choz. Build interactive assessments with multiple question types."
        />
        <meta property="og:site_name" content="Choz" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create New Exam | Choz" />
        <meta
          name="twitter:description"
          content="Create engaging exams with reward distribution on Choz. Build interactive assessments with multiple question types."
        />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="/app/create-exam" />
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

export default CreateExam;
