import styles from "@/styles/app/create-exam/CreateExam.module.css";
import Image from "next/image";

import ArrowBottom from "@/icons/arrow_bottom.svg";
import * as Select from "@radix-ui/react-select";
import { useFormContext, get, Controller } from "react-hook-form";
import { SelectItem } from "./select-item";
import classNames from "classnames";

interface DurationPickerProps {
  name: string;
  label: string;
}

export const DurationPicker = ({ name, label }: DurationPickerProps) => {
  const { control, formState } = useFormContext();
  const error = get(formState.errors, name);
  const errorText = error?.message;

  const htmlFor = `${name}-trigger`;

  return (
    <div className={styles.form_element_container}>
      <label className={styles.form_element_title} htmlFor={htmlFor}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select.Root onValueChange={onChange} value={value}>
            <Select.Trigger className="SelectTrigger" id={htmlFor}>
              <Select.Value placeholder="Select duration" />
              <Select.Icon className="SelectIcon">
                <Image src={ArrowBottom} alt="" width={12} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="SelectContent">
                <Select.Viewport className="SelectViewport">
                  <Select.Group>
                    <SelectItem value="10">10 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                    <SelectItem value="90">90 Minutes</SelectItem>
                    <SelectItem value="120">120 Minutes</SelectItem>
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}
      />

      {errorText ? (
        <p className={classNames(styles.form_element_info, errorText && styles.form_element_error)}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
};
