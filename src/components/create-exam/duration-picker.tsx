import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface DurationPickerProps {
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
}

export const DurationPicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  className,
  description,
  placeholder,
}: {
  control: ControllerProps<TFieldValues, TName>["control"];
  name: ControllerProps<TFieldValues, TName>["name"];
} & DurationPickerProps) => {
  const [customDuration, setCustomDuration] = useState<string | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => {
              if (value === "custom") {
                setCustomDuration("");
              } else {
                setCustomDuration(null);
                field.onChange(value);
              }
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="box-border justify-between">
                <SelectValue 
                  placeholder={
                    customDuration !== null
                      ? `${customDuration} Minutes`
                      : placeholder
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>

          {customDuration !== null && (
            <Input
              type="number"
              placeholder="Enter custom duration (minutes)"
              value={customDuration}
              onChange={(e) => {
                const value = e.target.value;
                setCustomDuration(value);
                field.onChange(value);
              }}
              onKeyDown={(e) => {
                if (e.key.length === 1 && !/[0-9]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
              className="mt-2 number-input"
            />
          )}

          <FormDescription className="text-xs text-ui-error-500">{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
