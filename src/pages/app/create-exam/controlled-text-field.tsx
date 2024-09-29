import styles from "@/styles/app/create-exam/CreateExam.module.css";
import classNames from "classnames";

import { Controller, useFormContext, get } from "react-hook-form";

interface BaseControlledTextFieldProps {
  name: string;
  label?: string;
  maxLength?: number;
  containerProps?: React.ComponentProps<"div">;
  helperTextProps?: React.ComponentProps<"p">;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

type InputProps = Omit<React.ComponentProps<"input">, "name"> &
  BaseControlledTextFieldProps & { multiline?: false };
type TextAreaProps = Omit<React.ComponentProps<"textarea">, "name"> &
  BaseControlledTextFieldProps & { multiline: true };

type ControlledTextFieldProps = InputProps | TextAreaProps;

export const ControlledTextField = ({
  name,
  containerProps,
  helperTextProps,
  label,
  maxLength,
  multiline,
  rightElement,
  leftElement,
  ...props
}: ControlledTextFieldProps) => {
  const { control, formState, watch } = useFormContext();
  const error = get(formState.errors, name);
  const errorText = error?.message;

  const value = watch(name);

  const style = {
    ...(leftElement ? { paddingLeft: "2.75rem" } : {}),
    ...(rightElement ? { paddingRight: "2.75rem" } : {}),
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={props.defaultValue}
      render={({ field }) => (
        <div className={styles.form_element_container} {...containerProps}>
          {label && (
            <label className={styles.form_element_title} htmlFor={name}>
              {label}{" "}
              {maxLength ? (
                <span className={styles.counter_text}>
                  {value?.length || 0}/{maxLength}
                </span>
              ) : null}
            </label>
          )}
          <div
            style={{
              position: "relative",
            }}
          >
            {leftElement && (
              <div
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "1rem",
                  height: "1rem",
                }}
              >
                {leftElement}
              </div>
            )}
            {multiline ? (
              <textarea
                id={name}
                {...(props as React.ComponentProps<"textarea">)}
                {...field}
                className={styles.form_element_textarea}
                maxLength={maxLength}
                style={style}
              />
            ) : (
              <input
                id={name}
                {...(props as React.ComponentProps<"input">)}
                {...field}
                className={styles.form_element_input}
                maxLength={maxLength}
                style={style}
              />
            )}
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {rightElement}
            </div>
          </div>

          {errorText ? (
            <p
              {...helperTextProps}
              className={classNames(
                styles.form_element_info,
                errorText && styles.form_element_error
              )}
            >
              {errorText}
            </p>
          ) : null}
        </div>
      )}
    />
  );
};
