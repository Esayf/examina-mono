import styles from "@/styles/app/create-exam/CreateExam.module.css";
import { ControlledTextField } from "./controlled-text-field";
import { Controller, useFieldArray } from "react-hook-form";
import { useStep2Form } from "./step2-schema";
import { TrashBinIcon } from "@/icons/TrashBinIcon";
import { Button } from "@/components/ui/button";
import { Radio } from "@/components/ui/radio";
import { MarkdownEditor } from "./markdown";
import classNames from "classnames";

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
}

export const Step2 = ({ onNext }: Step2Props) => {
  const {
    control,
    formState: { errors },
  } = useStep2Form();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  return (
    <div
      className={styles.create_exam_form_container}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {fields.map((field, index) => {
        return (
          <div
            key={field.id}
            className={styles.form_element_container}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <Controller
              control={control}
              name={`questions.${index}.question`}
              render={({ field: { onChange, value } }) => (
                <MarkdownEditor
                  markdown={value}
                  onChange={(markdown) => {
                    onChange(markdown);
                  }}
                />
              )}
            />
            {errors.questions && errors.questions[index]?.question && (
              <p className={classNames(styles.form_element_info, styles.form_element_error)}>
                {errors.questions[index]?.question.message}
              </p>
            )}

            <Answers index={index} />
            {fields.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  remove(index);
                }}
              >
                Remove Question
              </Button>
            )}
          </div>
        );
      })}
      <div className={styles.form_element_button_container}>
        <Button
          onClick={() =>
            append({ question: "", correctAnswer: "0", answers: [{ answer: "" }, { answer: "" }] })
          }
        >
          Add Question
        </Button>
      </div>
      <div className={styles.form_element_button_container}>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </div>
  );
};
