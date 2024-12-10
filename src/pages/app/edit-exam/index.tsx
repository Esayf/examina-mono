import React, { useEffect, useState } from "react";
import Head from "next/head";
import DashboardHeader from "@/components/ui/dashboard-header";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Step2FormValues, step2ValidationSchema } from "@/components/create-exam/step2-schema";
import { Step1FormValues, step1ValidationSchema } from "@/components/create-exam/step1-schema";
import { Step2 } from "@/components/create-exam/step2";
import { Step1 } from "@/components/create-exam/step1";
import { getExamDetails, updateExam } from "@/lib/Client/Exam"; // Exam API çağrıları

type FormValues = Step1FormValues | Step2FormValues;

const validationSchema = [step1ValidationSchema, step2ValidationSchema] as const;

function EditExam({ examId }: { examId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<FormValues | null>(null);

  const currentValidationSchema = validationSchema[currentStep];

  const methods = useForm<FormValues>({
    shouldUnregister: false,
    resolver: zodResolver(currentValidationSchema),
    mode: "onChange",
    defaultValues: initialData || {
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

  const { trigger, reset, handleSubmit } = methods;

  // API'den mevcut sınav bilgilerini al
  useEffect(() => {
    const fetchExamDetails = async () => {
      setIsLoading(true);
      try {
        const examDetails = await getExamDetails(examId); // API çağrısı
        setInitialData(examDetails);
        reset(examDetails); // Formu doldur
      } catch (error) {
        console.error("Failed to fetch exam details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExamDetails();
  }, [examId, reset]);

  const handleNext = async () => {
    const isStepValid = await trigger();
    if (isStepValid) setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateExam(examId, data); // API ile sınavı güncelle
      alert("Exam updated successfully!");
    } catch (error) {
      console.error("Failed to update exam:", error);
      alert("An error occurred while updating the exam.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="h-dvh flex flex-col">
      <Head>
        <title>Edit Exam | Choz</title>
        <meta name="description" content="Edit your existing quiz on Choz. Update questions, answers, and rewards easily with our intuitive platform." />
        <meta name="keywords" content="edit quiz, update quiz, quiz platform, assessment tool, Choz" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Edit Exam | Choz" />
        <meta property="og:description" content="Edit your existing exam on Choz. Update questions, answers, and rewards easily." />
        <meta property="og:site_name" content="Choz" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Edit Exam | Choz" />
        <meta name="twitter:description" content="Edit your existing exam on Choz. Update questions, answers, and rewards easily." />
      </Head>
      <DashboardHeader withoutNav={false} />
      <div className="sm:px-4 lg:px-8 h-full flex flex-col overflow-hidden">
        <div className="max-w-[76rem] w-full mx-auto flex flex-col pb-12 pt-8 flex-1 overflow-hidden">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 0 && <Step1 onNext={handleNext} />}
              {currentStep === 1 && <Step2 onBack={handleBack} />}
              {currentStep === 1 && (
                <div className="flex justify-end mt-4">
                  <button type="submit" className="btn-primary">Update Exam</button>
                </div>
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export default EditExam;
