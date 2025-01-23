"use client";

import React, { useEffect, useState } from "react";
import { DurationPicker } from "./duration-picker";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import BGR from "@/images/backgrounds/bg-5.svg";
import {
  ArrowLeftIcon,
  ClockIcon,
  Squares2X2Icon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  ArrowUpRightIcon,
  EyeDropperIcon,
  RocketLaunchIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStep2Form } from "./step2-schema";
import { ControlledDateTimePicker } from "./controlled-date-time-picker";
import { PublishButton } from "./publish-button";
import { RewardDistributionForm } from "./reward-distrubition";
import { Switch } from "../ui/switch";
import "../../styles/mdxeditor.css";
import "../../styles/globals.css";
import { cn } from "@/lib/utils";
import { MarkdownEditor } from "./markdown";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Aşağıdaki PreviewModal importu (yeni ekledik):
import { PreviewModal } from "./preview-modal";
import { LiveExamPreview } from "./live-exam-preview";
import { useStep1Form } from "./step1-schema";
import { toast } from "react-hot-toast"; // <-- ek

interface Step2Props {
  onBack: () => void;
}

export const Step2 = ({ onBack }: Step2Props) => {
  // 1) Form Hook ve isDirty / isSubmitted takibi
  const form = useStep2Form();
  const {
    formState: { isDirty, isSubmitted },
  } = form;

  // 2) Step1 verileri
  const { getValues: getStep1Values } = useStep1Form();
  const step1Values = getStep1Values();
  const rewardDistribution = form.watch("rewardDistribution");

  // 3) Alanlar izleme
  const titleValue = form.watch("title") || "";
  const descriptionValue = form.watch("description") || "";
  const startDateValue = form.watch("startDate");
  const durationValue = form.watch("duration");

  // 4) Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 5) beforeunload'da uyarı: eğer form dirty + not submitted
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitted) {
        // Tarayıcının default uyarısı
        e.preventDefault();
        e.returnValue = "";
        // Toast ek bilgi (çoğu tarayıcı sayfa kapanırken kısa bir anlık gösterebilir veya hiç göstermeyebilir)
        toast.error("Your quiz details may be lost if you leave or refresh the page!");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isSubmitted]);

  return (
    <>
      <Card className="bg-base-white rounded-2xl md:rounded-3xl flex-1 flex flex-col overflow-y-auto">
        <CardHeader>
          <Button variant="outline" size="icon" pill onClick={onBack}>
            <ArrowLeftIcon className="size-5 shrink-0" />
          </Button>
          <CardHeaderContent>
            <CardTitle className="hidden md:block">Complete your quiz details</CardTitle>
          </CardHeaderContent>
          <div className="flex flex-row justify-center gap-2">
            {/* Preview Button (Modal'ı açar) */}
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
              <span className="hidden sm:inline">Preview quiz</span>
              <EyeIcon className="w-6 h-6 sm:ml-2" />
            </Button>

            <PublishButton />
          </div>
        </CardHeader>

        <CardContent className="w-full px-5 py-5 space-y-5 flex-1 overflow-y-auto gap-8 flex-col relative mb-5">
          {/* 1) Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => {
              const maxChars = 50;
              const characterCount = field.value?.length || 0;
              const isOverLimit = characterCount > maxChars;

              return (
                <FormItem>
                  <p className="text-lg font-bold text-brand-primary-950 mb-2">1. Quiz title </p>
                  <FormLabel>What would you like to call this quiz?</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g. General Knowledge Challenge! 💪😎"
                        className={cn(
                          "rounded-2xl border max-h-[52px]",
                          isOverLimit
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-greyscale-light-300"
                        )}
                        {...field}
                      />
                      <div
                        className={cn(
                          "text-sm absolute right-3 top-3",
                          isOverLimit ? "text-red-500" : "text-greyscale-light-500"
                        )}
                      >
                        {`${characterCount}/50`}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    A descriptive title will give participants an indication of what the quiz is
                    about.
                  </FormDescription>
                  {isOverLimit && (
                    <p className="text-red-500 text-sm mt-1">
                      The description exceeds the maximum allowed {maxChars} characters.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* 2) Schedule */}
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 gap-4">
              <p className="text-lg font-bold text-brand-primary-950 mb-2">2. Schedule your quiz</p>
              <div className="flex gap-4 justify-between flex-col sm:flex-row">
                <ControlledDateTimePicker
                  control={form.control}
                  name="startDate"
                  label="When should this quiz start?"
                  description="Choose a date and time for the quiz to begin."
                  className="flex-1"
                  calendarProps={{
                    disabled: { before: new Date(Date.now() + 10 * 60 * 1000) },
                  }}
                />
                <DurationPicker
                  className="flex-1"
                  name="duration"
                  label="How long should this quiz take?"
                  control={form.control}
                  description="Once the time is up, the quiz will automatically end."
                  placeholder="Select duration (in minutes)"
                />
              </div>
            </div>
          </div>

          {/* 3) Description (Markdown) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              const maxChars = 960;
              const characterCount = field.value?.length || 0;
              const isOverLimit = characterCount > maxChars;

              return (
                <FormItem>
                  <p className="text-lg font-bold text-brand-primary-950 mb-2">3. About quiz</p>
                  <FormLabel>Any guidelines or final remarks you'd like to include?</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "relative border rounded-2xl bg-base-white min-h-[240px] max-h-[960px] resize-y overflow-y-auto ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-800",
                        isOverLimit
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-greyscale-light-200"
                      )}
                    >
                      <MarkdownEditor
                        className="mdxeditor h-full"
                        markdown={field.value || ""}
                        onChange={field.onChange}
                        contentEditableClassName="contentEditable"
                      />
                      {/* Karakter sayısı sağ üstte */}
                      <div
                        className={cn(
                          "text-sm absolute right-3 top-3 z-40",
                          isOverLimit ? "text-red-500" : "text-greyscale-light-500"
                        )}
                      >
                        {`${characterCount}/${maxChars}`}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    An engaging and clear description ensures participants understand the purpose
                    and format of the quiz.
                  </FormDescription>
                  {isOverLimit && (
                    <p className="text-red-500 text-sm mt-1">
                      The description exceeds the maximum allowed {maxChars} characters.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* 4) Reward Distribution */}
          <FormField
            control={form.control}
            name="rewardDistribution"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-end">
                <div className="space-y-0.5">
                  <FormLabel className="text-base pe-4">Reward distribution</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 5) RewardDistributionForm */}
          {rewardDistribution && <RewardDistributionForm />}
        </CardContent>
      </Card>

      {/* PreviewModal => TIKLANINCA AÇILMASI GEREKEN YER */}
      <PreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={titleValue}
        description={descriptionValue}
        startDate={startDateValue}
        duration={durationValue}
        questionsCount={step1Values.questions.length}
      />
    </>
  );
};
