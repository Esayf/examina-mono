import styles from "@/styles/app/create-exam/CreateExam.module.css";
import React, { useState } from "react";

// Radix Primitives
import * as Tabs from "@radix-ui/react-tabs";

import DashboardHeader from "@/components/ui/DashboardHeader";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Step1FormValues, step1ValidationSchema } from "./step1-schema";
import { Step2FormValues, step2ValidationSchema } from "./step2-schema";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";

type FormValues = Step1FormValues | Step2FormValues;

const validationSchema = [step1ValidationSchema, step2ValidationSchema] as const;

// const uploadFile = async (file: any) => {
//   if (!file) {
//     alert("No file selected");
//     return;
//   }

//   try {
//     const keyRequest = await fetch("/api/key");
//     const keyData = await keyRequest.json();
//     const upload = await pinata.upload.file(file).key(keyData.JWT);
//     // const ipfsUrl = await pinata.gateways.convert(upload.IpfsHash);
//     console.log(upload.IpfsHash);
//     return `/api/proxy?hash=${upload.IpfsHash}`;
//   } catch (e) {
//     console.log(e);
//     alert("Trouble uploading file");
//   }
// };

function CreateExam() {
  const [currentStep, setCurrentStep] = useState(0);

  const currentValidationSchema = validationSchema[currentStep];

  const methods = useForm<FormValues>({
    shouldUnregister: false,
    resolver: zodResolver(currentValidationSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      questions: [
        {
          question: "",
          correctAnswer: "0",
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

  const { trigger, getValues } = methods;

  const handleNext = async () => {
    const isStepValid = await trigger();
    if (isStepValid) setCurrentStep((prevStep) => prevStep + 1);
  };

  const validateStep = (step: number) => {
    const values = getValues();
    const schema = validationSchema[step];
    return schema.safeParse(values).success;
  };

  return (
    <div className={styles.container}>
      <DashboardHeader withoutNav />
      <Tabs.Root
        value={currentStep.toString()}
        onValueChange={(value) => setCurrentStep(parseInt(value))}
        className={styles.stepper_container}
      >
        <Tabs.List aria-label="create exam" className={styles.stepper_selector_container}>
          <Tabs.Trigger className={styles.stepper_selector} value="0">
            <h3 className={styles.stepper_selector_title}>
              <span className={styles.stepper_selector_title_bold}>Step 1</span> Exam details
            </h3>
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.stepper_selector} value="1" disabled={!validateStep(0)}>
            <h3 className={styles.stepper_selector_title}>
              <span className={styles.stepper_selector_title_bold}>Step 2</span> Create questions
            </h3>
          </Tabs.Trigger>
          <Tabs.Trigger
            className={styles.stepper_selector}
            value="2"
            disabled={!validateStep(0) || !validateStep(1)}
          >
            <h3 className={styles.stepper_selector_title}>
              <span className={styles.stepper_selector_title_bold}>Step 3</span> Finish
            </h3>
          </Tabs.Trigger>
        </Tabs.List>
        <FormProvider {...methods}>
          <Tabs.Content value="0">
            <Step1 onNext={handleNext} />
          </Tabs.Content>
          <Tabs.Content value="1">
            <Step2 onNext={handleNext} />
          </Tabs.Content>
          <Tabs.Content value="2">
            <Step3 />
          </Tabs.Content>
        </FormProvider>
      </Tabs.Root>
    </div>
  );
}

export default CreateExam;
