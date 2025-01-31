"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/outline";
import { BACKGROUND_OPTIONS } from "./background-options";
import { useStep3Form } from "./step3-schema";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormProvider } from "react-hook-form";
import Image from "next/image";
import { PreviewModal } from "./preview-modal";

interface Step3Props {
  onBack: () => void; // Step2'ye dönmek için
  onPublish: () => void; // Publish butonuna tıklandığında çağrılacak fonksiyon
}

export const Step3 = ({ onBack, onPublish }: Step3Props) => {
  // 1) Step3 form hook (introBg & liveBg)
  const step3Form = useStep3Form();

  // 2) Preview modal açık/kapalı state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 3) Seçilen değerleri izliyoruz
  const introBgValue = step3Form.watch("quizIntroBackground");
  const liveBgValue = step3Form.watch("liveQuizBackground");

  // 4) "Publish" butonuna basınca form verisini kaydetmek veya doğrulamak isterseniz handleSubmit kullanabilirsiniz
  const handlePublish = step3Form.handleSubmit((formValues) => {
    // Burada formValues.quizIntroBackground ve formValues.liveQuizBackground geliyor
    console.log("Publishing with backgrounds:", formValues);
    // Ardından onPublish'i çağırabilirsiniz (ya da db'ye kaydedip sonra)
    onPublish();
  });

  return (
    <FormProvider {...step3Form}>
      <form className="h-full flex flex-col">
        <Card className="bg-base-white rounded-2xl md:rounded-3xl flex-1 flex flex-col overflow-y-auto">
          <CardHeader>
            {/* Geri butonu -> Step2'ye dönmek için */}
            <Button variant="outline" size="icon" pill onClick={onBack}>
              <ArrowLeftIcon className="size-5 shrink-0" />
            </Button>

            {/* Başlık ve açıklama */}
            <CardHeaderContent>
              <CardTitle className="hidden md:block">Select Backgrounds</CardTitle>
              <CardDescription>
                Customize the background for both the quiz intro screen and the live quiz screen.
              </CardDescription>
            </CardHeaderContent>

            {/* Sağ üstteki butonlar: Preview ve Publish */}
            <div className="flex flex-row justify-center gap-2">
              <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                <span className="hidden sm:inline">Preview</span>
                <EyeIcon className="w-6 h-6 sm:ml-2" />
              </Button>
              <Button variant="default" onClick={handlePublish}>
                Publish
              </Button>
            </div>
          </CardHeader>

          {/* Kart içeriği: 2 farklı arka plan seçimi */}
          <CardContent className="w-full px-5 py-5 space-y-6 flex-1 overflow-y-auto relative">
            {/* 1) Quiz Intro Background */}
            <FormField
              name="quizIntroBackground"
              // "control" yerine "FormProvider" kullanıyorsak "form.control" dememize gerek yok
              control={step3Form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold text-brand-primary-950 mb-2">
                    1. Quiz Intro Background
                  </FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {BACKGROUND_OPTIONS.map((bg) => {
                      const isSelected = field.value === bg.value;
                      return (
                        <div
                          key={bg.value}
                          className={`
                            relative cursor-pointer border rounded-lg overflow-hidden 
                            hover:opacity-90 transition 
                            ${
                              isSelected
                                ? "ring-2 ring-brand-primary-500"
                                : "border-greyscale-light-300"
                            }
                          `}
                          onClick={() => field.onChange(bg.value)}
                        >
                          <Image
                            src={bg.value}
                            alt={bg.label}
                            width={300}
                            height={200}
                            className="object-cover w-full h-32"
                          />
                          <div className="text-sm text-center p-1 font-medium">{bg.label}</div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-brand-primary-500 text-white rounded-full p-1 text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2) Live Quiz Background */}
            <FormField
              name="liveQuizBackground"
              control={step3Form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-lg font-bold text-brand-primary-950 mb-2">
                      2. Live Quiz Background
                    </FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {BACKGROUND_OPTIONS.map((bg) => {
                        const isSelected = field.value === bg.value;
                        return (
                          <div
                            key={bg.value}
                            className={`
                              relative cursor-pointer border rounded-lg overflow-hidden
                              hover:opacity-90 transition
                              ${
                                isSelected
                                  ? "ring-2 ring-brand-primary-500"
                                  : "border-greyscale-light-300"
                              }
                            `}
                            onClick={() => field.onChange(bg.value)}
                          >
                            <Image
                              src={bg.value}
                              alt={bg.label}
                              width={300}
                              height={200}
                              className="object-cover w-full h-32"
                            />
                            <div className="text-sm text-center p-1 font-medium">{bg.label}</div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-brand-primary-500 text-white rounded-full p-1 text-xs">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </CardContent>
        </Card>
      </form>

      {/* Preview Modal - Seçilen arkaplanları prop olarak geçiyoruz */}
      <PreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Background Preview"
        description="Here is how your chosen backgrounds might look."
        startDate={new Date()}
        duration="120"
        questionsCount={0}
      />
    </FormProvider>
  );
};
