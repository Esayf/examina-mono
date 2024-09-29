import styles from "@/styles/app/create-exam/CreateExam.module.css";
import React from "react";

import { ControlledTextField } from "./controlled-text-field";
import { DatePickerDialog } from "./date-picker-dialog";
import { DurationPicker } from "./duration-picker";
import { Button } from "@/components/ui/button";

interface Step1Props {
  onNext: () => void;
}

export const Step1 = ({ onNext }: Step1Props) => (
  <div
    className={styles.create_exam_form_container}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2rem",
    }}
  >
    <ControlledTextField
      name="title"
      placeholder="Enter exam title"
      maxLength={120}
      label="Exam title"
    />
    <ControlledTextField
      name="description"
      placeholder="Exam description"
      maxLength={1200}
      label="Exam title"
      multiline
    />
    <div className={styles.create_exam_form_row}>
      <DatePickerDialog
        name="startDate"
        label="Start date"
        helperText="Please select date which you want to start exam."
      />
      <DurationPicker name="duration" label="Duration" />
    </div>

    <div className={styles.form_element_button_container}>
      <Button
        onClick={() => {
          onNext();
        }}
      >
        Next Step
      </Button>
    </div>
  </div>
);
