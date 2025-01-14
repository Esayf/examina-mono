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
  // Eğer "custom" seçildiyse, burada tutulacak
  const [customDuration, setCustomDuration] = useState<string | null>(null);
  const [isUnderOne, setIsUnderOne] = useState(false);

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
                setIsUnderOne(false);
              } else {
                setCustomDuration(null);
                setIsUnderOne(false);
                field.onChange(value);
              }
            }}
            // Mevcut field değerine göre defaultValue veriyoruz
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

          {/* Eğer custom seçildiyse ekstra input göster */}
          {customDuration !== null && (
            <div className="mt-2">
              <Input
                type="number"
                min={1} // HTML düzeyinde minimum 1
                placeholder="Enter custom duration (minutes)"
                value={customDuration}
                onChange={(e) => {
                  let val = e.target.value;

                  // Kullanıcı tamamen siliyorsa, boş bırakmak isteyebiliriz
                  if (val === "") {
                    setCustomDuration("");
                    field.onChange("");
                    setIsUnderOne(false);
                    return;
                  }

                  // 1) Eğer girilen ilk karakter 0 ise anında düzelt
                  if (val.length === 1 && val === "0") {
                    val = "1"; // “0” girilmişse “1” yap
                  }

                  // 2) Sayısal değeri parse et
                  let numericVal = parseInt(val, 10);

                  // 3) 1’den küçükse 1’e sabitle
                  if (numericVal < 1) {
                    numericVal = 1;
                  }

                  setCustomDuration(numericVal.toString());
                  field.onChange(numericVal.toString());
                  setIsUnderOne(numericVal < 1);
                }}
                onKeyDown={(e) => {
                  // Kullanıcı harf gibi geçersiz karakter girerse engelle
                  // Ayrıca "0" girilmeye başlarken (ilk karakter olarak) da engellenebilir
                  if (
                    e.key.length === 1 &&
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="number-input"
              />
              {isUnderOne && (
                <p className="mt-1 text-sm text-red-600">
                  Minimum 1 dakika olmalı
                </p>
              )}
            </div>
          )}

          <FormDescription className="text-xs text-ui-error-500">
            {description}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
