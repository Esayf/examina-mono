"use client";

import React, { useState } from "react";

// Form Hooks
import { useStep2Form } from "./step2-schema";
import { useStep1Form } from "./step1-schema";

// Custom Components
import { DurationPicker } from "./duration-picker";
import { ControlledDateTimePicker } from "./controlled-date-time-picker";
import { PublishButton } from "./publish-button";
import { RewardDistributionForm } from "./reward-distrubition";
import { SaveAsDraftButton } from "./save-as-draft-button";
import { MarkdownEditor } from "./markdown";
import { PreviewModal } from "./preview-modal";

// UI Components
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  EyeIcon,
  PencilIcon,
  Squares2X2Icon,
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// Utilities
import { cn } from "@/lib/utils";

// Styles
import "../../styles/mdxeditor.css";
import "../../styles/globals.css";

// Karakter sınırlarını tek bir yerde sabitlemek için
const TITLE_MAX_CHARS = 50;
const DESCRIPTION_MAX_CHARS = 960;

interface Step2Props {
  onBack: () => void;
  onPublish: () => void;
}

export const Step2 = ({ onBack, onPublish }: Step2Props) => {
  // 1) Form Hook ve isDirty / isSubmitted takibi
  const form = useStep2Form();
  const {
    formState: { isDirty, isSubmitted },
  } = form;

  /**
   * 2) Step1 form verileri (örneğin soru sayısı gibi bilgileri burada kullanabiliriz)
   */
  const { getValues: getStep1Values } = useStep1Form();
  const step1Values = getStep1Values();

  /**
   * 3) Dinamik alanları izleme
   */
  const rewardDistribution = form.watch("rewardDistribution");
  const titleValue = form.watch("title") || "";
  const descriptionValue = form.watch("description") || "";
  const startDateValue = form.watch("startDate");
  const durationValue = form.watch("duration");

  /**
   * 4) Quiz önizleme (Preview) modalı için state
   */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <Card className="bg-base-white rounded-2xl md:rounded-3xl flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <CardHeader>
          {/* Geri butonu */}
          <Button variant="outline" size="icon" pill onClick={onBack}>
            <ArrowLeftIcon className="size-5 shrink-0" />
          </Button>

          {/* Başlık */}
          <CardHeaderContent>
            <CardTitle className="hidden md:block">Complete your quiz details</CardTitle>
          </CardHeaderContent>

          {/* Sağ üst aksiyonlar: Taslak kaydet & Yayınla */}
          <div className="flex flex-row justify-center gap-2">
            <SaveAsDraftButton />
            <PublishButton onPublishStart={onPublish} />
          </div>
        </CardHeader>

        <CardContent className="w-full px-5 py-5 space-y-5 flex-1 overflow-y-auto gap-8 flex-col relative bg-brand-secondary-50">
          {/* Quiz önizleme butonu (Modal açar) */}
          <div className="flex justify-end">
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsPreviewOpen(true)}
              className="absolute right-6 transition-colors gap-2"
            >
              <EyeIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* 1) Quiz Başlığı */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => {
              const characterCount = field.value?.length || 0;
              const isOverLimit = characterCount > TITLE_MAX_CHARS;

              return (
                <div className="flex-1 gap-4 bg-white p-4 rounded-3xl border border-greyscale-light-200">
                  <h3 className="text-xl font-bold text-brand-primary-950 mb-4 flex items-center gap-2">
                    <Squares2X2Icon className="size-6 shrink-0" />
                    Basic Information
                  </h3>
                  <FormItem>
                    <div className="flex flex-col gap-2">
                      <FormLabel>What would you like to call this quiz?</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g. General Knowledge Challenge! 💪😎"
                            className={cn(
                              "rounded-2xl border h-[3rem] font-light",
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
                            {`${characterCount}/${TITLE_MAX_CHARS}`}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        A descriptive title will give participants an indication of what the quiz is
                        about.
                      </FormDescription>
                      {isOverLimit && (
                        <p className="text-red-500 text-sm mt-1">
                          The title exceeds the maximum allowed {TITLE_MAX_CHARS} characters.
                        </p>
                      )}
                      <FormMessage />
                    </div>
                  </FormItem>
                </div>
              );
            }}
          />

          {/* 2) Quiz Başlangıç Zamanı & Süresi */}
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 gap-4 bg-white p-4 rounded-3xl border border-greyscale-light-200">
              <p className="text-xl font-bold text-brand-primary-950 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="size-6 shrink-0" />
                Schedule Quiz
              </p>
              <div className="flex gap-4 justify-between flex-col sm:flex-row">
                <ControlledDateTimePicker
                  control={form.control}
                  name="startDate"
                  label="When should this quiz start?"
                  description="Choose a date and time for the quiz to begin."
                  className="flex-1 gap-2"
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

          {/* 3) Quiz Açıklaması (Markdown) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              const characterCount = field.value?.length || 0;
              const isOverLimit = characterCount > DESCRIPTION_MAX_CHARS;

              return (
                <div className="flex-1 gap-4 bg-white p-4 rounded-3xl border border-greyscale-light-200">
                  <FormItem>
                    <p className="text-lg font-bold text-brand-primary-950 mb-4 flex items-center gap-2">
                      <PencilIcon className="size-4 shrink-0" />
                      About Quiz
                    </p>
                    <div className="flex flex-col gap-2">
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
                          />
                          <div
                            className={cn(
                              "text-sm absolute right-3 top-3",
                              isOverLimit ? "text-red-500" : "text-greyscale-light-500"
                            )}
                          >
                            {`${characterCount}/${DESCRIPTION_MAX_CHARS}`}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        An engaging and clear description ensures participants understand the
                        purpose and format of the quiz.
                      </FormDescription>
                      {isOverLimit && (
                        <p className="text-red-500 text-sm mt-1">
                          The description exceeds the maximum allowed {DESCRIPTION_MAX_CHARS}{" "}
                          characters.
                        </p>
                      )}
                      <FormMessage />
                    </div>
                  </FormItem>
                </div>
              );
            }}
          />

          {/* 4) Ödül Dağıtım Anahtarı (Switch) */}
          <FormField
            control={form.control}
            name="rewardDistribution"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-end">
                <FormLabel className="text-base pe-4 mb-0">Reward distribution</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* 5) Ödül Dağıtım Formu (switch aktifse göster) */}
          {rewardDistribution && <RewardDistributionForm />}
        </CardContent>
      </Card>

      {/* 6) Quiz Önizleme Modalı */}
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
