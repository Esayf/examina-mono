"use client";

import React, { useState } from "react";
import { DurationPicker } from "./duration-picker";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ClockIcon,
  Squares2X2Icon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  ArrowUpRightIcon,
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

// shadcn UI (veya kendi modal bileşeniniz)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PreviewModal } from "./preview-modal";

interface Step2Props {
  onBack: () => void;
}

export const Step2 = ({ onBack }: Step2Props) => {
  const form = useStep2Form();
  const rewardDistribution = form.watch("rewardDistribution");

  // Form alanlarını izliyoruz
  const titleValue = form.watch("title") || "";
  const descriptionValue = form.watch("description") || "";
  const startDateValue = form.watch("startDate");
  const durationValue = form.watch("duration");

  // Preview Modal kontrolü
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      {/* Asıl Form Kartı */}
      <Card className="bg-base-white rounded-2xl md:rounded-3xl flex-1 flex flex-col overflow-y-auto">
        <CardHeader>
          <Button size="icon" pill variant="default" onClick={onBack}>
            <ArrowLeftIcon className="size-5 shrink-0" />
          </Button>
          <CardHeaderContent>
            <CardTitle>Complete your quiz details</CardTitle>
            <CardDescription>
              Enter quiz details before creating questions, this will give
              participants information about the quiz.
            </CardDescription>
          </CardHeaderContent>
          <PublishButton />
        </CardHeader>

        <CardContent className="w-full px-5 py-5 space-y-5 flex-1 overflow-y-auto gap-8 flex-col relative mb-5">
          {/* 1) Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => {
              const characterCount = field.value?.length || 0;
              const isOverLimit = characterCount > 60;

              return (
                <FormItem>
                  <p className="text-lg font-bold text-brand-primary-950 mb-2">
                    1. Quiz name
                  </p>
                  <FormLabel>Quiz title</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        maxLength={60}
                        placeholder="Give your quiz a clear, engaging title.."
                        className={cn(
                          "rounded-2xl border",
                          isOverLimit
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-greyscale-light-300"
                        )}
                        {...field}
                      />
                      <div
                        className={cn(
                          "text-sm absolute right-3 top-3",
                          isOverLimit
                            ? "text-red-500"
                            : "text-greyscale-light-500"
                        )}
                      >
                        {`${characterCount}/60`}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    A descriptive title will give participants an indication of what the quiz is about.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* 2) Schedule */}
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 gap-4">
              <p className="text-lg font-bold text-brand-primary-950 mb-2">
                2. Schedule your quiz (Set start date and duration)
              </p>
              <div className="flex gap-4 justify-between flex-col sm:flex-row">
                <ControlledDateTimePicker
                  control={form.control}
                  name="startDate"
                  label="When should this quiz start?"
                  description="Choose a date and time for the quiz to begin."
                  placeholder="Select date and time"
                  className="flex-1"
                  calendarProps={{
                    disabled: { before: new Date(Date.now() + 10 * 60 * 1000) },
                  }}
                />
                <DurationPicker
                  className="flex-1"
                  name="duration"
                  label="How long should this quiz take? (in minutes)"
                  control={form.control}
                  description="Once the time is up, the quiz will automatically end."
                  placeholder="Select duration"
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
                  <p className="text-lg font-bold text-brand-primary-950 mb-2">
                    3. About quiz
                  </p>
                  <FormLabel>Quiz overview for participants</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "relative border rounded-2xl bg-base-white min-h-[240px] max-h-[960px] resize-y overflow-y-auto ring-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary-400",
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
                          isOverLimit
                            ? "text-red-500"
                            : "text-greyscale-light-500"
                        )}
                      >
                        {`${characterCount}/${maxChars}`}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    An engaging and clear description ensures participants understand the purpose and format of the quiz.
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

          {/* Preview Button (Modal'ı açar) */}
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="self-start"
          >
            Preview start page
          </Button>

          {/* 4) Reward Distribution */}
          <FormField
            control={form.control}
            name="rewardDistribution"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-end">
                <div className="space-y-0.5">
                  <FormLabel className="text-base pe-4">
                    Reward distribution
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 5) RewardDistributionForm */}
          {rewardDistribution && <RewardDistributionForm />}
        </CardContent>
      </Card>

      {/* 
        MODAL: Quiz'in "Preview" ekranı 
        Daha esnek, responsive tasarım için 
        w-full ve max-w-[90vw] vb. kombinasyonu kullanıyoruz.
      */}
       {/* PreviewModal bileşeni */}
      <PreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={titleValue}
        description={descriptionValue}
        startDate={startDateValue}
        duration={durationValue}
      />
    </>
  );
};
