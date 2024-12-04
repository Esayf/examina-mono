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
import { Input } from "@/components/ui/input"; // Kullanıcıdan veri almak için
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
                setCustomDuration(""); // Custom seçildiğinde boş input göster
              } else {
                setCustomDuration(null); // Diğer seçimlerde input'u gizle
                field.onChange(value); // Seçilen değeri kaydet
              }
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="box-border">
                <SelectValue
                  placeholder={
                    customDuration !== null
                      ? `${customDuration} Minutes` // Custom seçiliyse göster
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
                field.onChange(value); // React Hook Form ile değeri kaydet
              }}
              className="mt-2"
            />
          )}

          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
