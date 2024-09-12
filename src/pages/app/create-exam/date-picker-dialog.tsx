import "react-clock/dist/Clock.css";

import styles from "@/styles/app/create-exam/CreateExam.module.css";
import React from "react";
import Image from "next/image";
import DateTimePicker from "react-datetime-picker";

import Close from "@/icons/close_mina_purple.svg";

import * as Dialog from "@radix-ui/react-dialog";

import { useFormContext, get, Controller } from "react-hook-form";
import classNames from "classnames";
import { Button } from "@/components/ui/button";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "short",
});

interface DatePickerDialogProps {
  name: string;
  label: string;
  helperText?: string;
}

export const DatePickerDialog = ({ name, label, helperText: infoText }: DatePickerDialogProps) => {
  const { control, formState, watch } = useFormContext();
  const error = get(formState.errors, name);
  const errorText = error?.message;
  const value = watch(name);

  const htmlFor = `${name}-trigger`;

  return (
    <div className={styles.form_element_container}>
      <label className={styles.form_element_title} htmlFor={htmlFor}>
        {label}
      </label>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className="Button violet" id={htmlFor}>
            {value instanceof Date ? dateFormatter.format(value) : "Select date"}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle">Select date</Dialog.Title>
            <Dialog.Description className="DialogDescription">{infoText}</Dialog.Description>
            <Controller
              name={name}
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <DateTimePicker onChange={onChange} value={value} minDate={new Date()} />
                </div>
              )}
            />
            <div
              style={{
                display: "flex",
                marginTop: "1.25rem",
                justifyContent: "flex-end",
              }}
            >
              <Dialog.Close asChild>
                <Button>Save</Button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" className="IconButton" aria-label="Close">
                <Image src={Close} alt="" width={24} />
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {errorText ? (
        <p className={classNames(styles.form_element_info, errorText && styles.form_element_error)}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
};
