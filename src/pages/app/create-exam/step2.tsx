import styles from "@/styles/app/create-exam/CreateExam.module.css";
import { ControlledTextField } from "./controlled-text-field";
import { Controller, useFieldArray } from "react-hook-form";
import { useStep2Form } from "./step2-schema";
import { TrashBinIcon } from "@/icons/TrashBinIcon";
import { Button } from "@/components/ui/button";
import { Radio } from "@/components/ui/radio";
import { MarkdownEditor } from "./markdown";
import QMark from "@/icons/question-mark-circle.svg";
import Trash from "@/icons/trash.svg";
import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";

interface AnswersProps {
  index: number;
}

const Answers = ({ index }: AnswersProps) => {
  const { control, register } = useStep2Form();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.answers`,
  });

  return (
    <div>
      <label className={styles.form_element_title}>
        Please write the answers and select the correct one.
      </label>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {fields.map((field, i) => {
          return (
            <ControlledTextField
              key={field.id}
              name={`questions.${index}.answers.${i}.answer`}
              placeholder={`Enter the ${i + 1}`}
              maxLength={120}
              leftElement={
                <Radio {...register(`questions.${index}.correctAnswer`)} value={i.toString()} />
              }
              rightElement={
                fields.length > 2 && (
                  <Button size="icon" variant="ghost" onClick={() => remove(i)}>
                    <TrashBinIcon />
                  </Button>
                )
              }
            />
          );
        })}
      </div>
      {fields.length < 4 && (
        <Button
          onClick={() => {
            append({ answer: "" });
          }}
          style={{
            marginTop: "1rem",
          }}
        >
          Add Answer
        </Button>
      )}
    </div>
  );
};

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step2 = ({ onNext, onBack }: Step2Props) => {
  const {
    control,
    formState: { errors },
  } = useStep2Form();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const activeQuestion = fields[activeQuestionIndex];

  return (
    <div className={styles.container_secondary}>
      <div className={styles.stepper_container_secondary}>
        <div className={styles.create_exam_form_container}>
          <div className={styles.create_exam_form_inner_container}>
            <div className={styles.form_element_container_question_first}>
              <h3 className={styles.form_element_title}>
                <Image src={QMark} alt="" /> Question Type
              </h3>

              <div
                key={activeQuestionIndex}
                className={styles.form_element_container}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                <Controller
                  control={control}
                  name={`questions.${activeQuestionIndex}.question`}
                  render={({ field: { onChange, value } }) => (
                    <MarkdownEditor
                      markdown={value}
                      onChange={(markdown) => {
                        onChange(markdown);
                      }}
                    />
                  )}
                />
                {errors.questions && errors.questions[activeQuestionIndex]?.question && (
                  <p className={classNames(styles.form_element_info, styles.form_element_error)}>
                    {errors.questions[activeQuestionIndex]?.question?.message}
                  </p>
                )}

                <Answers index={activeQuestionIndex} />
              </div>

              <div className={styles.form_element_button_container}>
                <Button onClick={onBack} variant="ghost" type="button">
                  Back
                </Button>
                <Button onClick={onNext}>Next Step</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.sidebar_container}>
        <div className={styles.questions_sidebar_container}>
          <h3 className={styles.questions_sidebar_header}>Question List</h3>
          <div className={styles.questions_sidebar_questions_container}>
            {fields.map((field, index) => {
              return (
                <div
                  className={
                    activeQuestionIndex === index
                      ? styles.question_sidebar_question_item_active
                      : styles.question_sidebar_question_item
                  }
                  key={index}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  <div className={styles.question_sidebar_question_item_inner}>
                    <p className={styles.question_sidebar_question_item_text}>
                      Question {index + 1}
                    </p>
                  </div>

                  <p className={styles.question_sidebar_question_item_text}>{field.question}</p>

                  <div className={styles.question_sidebar_question_item_controller_container}>
                    {fields.length > 1 && (
                      <Image
                        src={Trash}
                        alt=""
                        className={styles.question_sidebar_question_item_controller}
                        onClick={() => {
                          remove(index);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div className={styles.question_sidebar_question_item}>
              <div className={styles.form_element_button_container}>
                <Button
                  onClick={() =>
                    append({
                      question: "",
                      correctAnswer: "0",
                      answers: [{ answer: "" }, { answer: "" }],
                    })
                  }
                >
                  Add Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
