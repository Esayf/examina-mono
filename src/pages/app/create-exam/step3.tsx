import styles from "@/styles/app/create-exam/CreateExam.module.css";
import React from "react";

import * as RadioGroup from "@radix-ui/react-radio-group";

import { useStep1Form } from "./step1-schema";
import { useStep2Form } from "./step2-schema";
import { useMutation } from "@tanstack/react-query";
import { createExam } from "@/lib/Client/Exam";
// @ts-ignore
import { v4 } from "uuid";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { MDXEditor } from "@mdxeditor/editor";

export const Step3 = () => {
  const { getValues: getStep1Values } = useStep1Form();

  const { getValues: getStep2Values } = useStep2Form();

  const step1Values = getStep1Values();
  const step2Values = getStep2Values();

  const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0);

  const activeQuestion = step2Values.questions[activeQuestionIndex];

  const router = useRouter();

  const { mutate: saveExam, isPending } = useMutation({
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

  return (
    <div className={styles.create_exam_form_container}>
      <div className={styles.preview_container}>
        <div className={styles.preview_question_container}>
          <div className={styles.question_container}>
            <p className={styles.question_describe}>Question {activeQuestionIndex + 1}</p>
            <MDXEditor markdown={activeQuestion.question} />
          </div>
          <div className={styles.answers_container}>
            <RadioGroup.Root
              className="RadioGroupRoot"
              defaultValue="default"
              aria-label="View density"
            >
              {activeQuestion.answers.map((answer, i) => {
                return (
                  <div
                    key={i}
                    className={`RadioGruopContainer ${
                      i.toString() === activeQuestion.correctAnswer && "RadioGroupContainer__active"
                    } RadioGruopContainerPreview`}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <RadioGroup.Item
                        className="RadioGroupItem"
                        value={answer.answer}
                        checked={activeQuestion.correctAnswer === i.toString()}
                      >
                        <RadioGroup.Indicator className="RadioGroupIndicator" />
                      </RadioGroup.Item>
                      <p className="RadioText">{answer.answer}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup.Root>
          </div>
        </div>
        <div className={styles.preview_selector_container}>
          <div className={styles.selector_container}>
            {step2Values.questions.map((question, i) => {
              return (
                <div
                  key={i}
                  className={`${styles.selector_box} ${
                    i === activeQuestionIndex && styles.selector_box_active
                  }`}
                  onClick={() => {
                    setActiveQuestionIndex(i);
                    console.log("activeQuestionIndex", activeQuestionIndex);
                  }}
                >
                  <p
                    className={`${styles.selector_box_text} ${
                      i === activeQuestionIndex && styles.selector_box_text_active
                    }`}
                  >
                    {i + 1}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.form_element_button_container}>
        <Button
          onClick={() => {
            saveExam({
              id: v4(),
              title: step1Values.title,
              description: step1Values.description,
              startDate: step1Values.startDate,
              duration: step1Values.duration,
              questions: step2Values.questions.map((question, i) => ({
                type: "mc",
                number: i + 1,
                text: question.question,
                description: question.question,
                options: question.answers.map((answer, i) => ({
                  number: i + 1,
                  text: answer.answer,
                })),
                correctAnswer: parseInt(question.correctAnswer) + 1,
              })),
            });
          }}
          disabled={isPending}
        >
          {isPending ? "Creating Exam..." : "Save and Finish"}
        </Button>
      </div>
    </div>
  );
};
