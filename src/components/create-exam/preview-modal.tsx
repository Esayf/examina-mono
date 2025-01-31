"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LiveExamPreview } from "@/components/create-exam/live-exam-preview";
import BGR from "@/images/backgrounds/bg-png.png";
import Image from "next/image";
import styles from "../../styles/Landing.module.css";

import {
  ArrowUpRightIcon,
  ClipboardDocumentIcon,
  Squares2X2Icon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 1) Farklı cihaz boyutlarını temsil eden bir enum ya da obje
enum Device {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
}

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  startDate?: string | Date;
  duration?: string;
  questionsCount?: number;
}

export function PreviewModal({
  open,
  onClose,
  title,
  description,
  startDate,
  duration,
  questionsCount,
}: PreviewModalProps) {
  // false => "Ekran 1: Quiz Preview"
  // true  => "Ekran 2: LiveExamPreview"
  const [showQuizPreview, setShowQuizPreview] = useState(false);

  // 2) Seçili cihaz boyutu
  const [previewDevice, setPreviewDevice] = useState<Device>(Device.DESKTOP);

  useEffect(() => {
    if (open) {
      setShowQuizPreview(false);
    }
  }, [open]);

  const numericDuration = duration ? Number(duration) : 120;

  // 3) Cihaz boyutu değiştiren fonksiyon
  const handleChangeDevice = (device: Device) => {
    setPreviewDevice(device);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      {/* Arkaplan resmi */}
      <div className={styles.hero_bg}>
        <Image src={BGR} alt="Hero Background" fill className="object-cover w-full h-full" />
      </div>

      <DialogContent
        className="
          bg-brand-secondary-50
          w-full
          max-w-[90vw]
          sm:max-w-[600px]
          md:max-w-[800px]
          lg:max-w-[1280px]
          min-h-[60vh]
          rounded-2xl
          flex
          flex-col
          gap-6
          pb-8
          px-4
          sm:px-6
          md:px-10
          mt-4
          overflow-auto
        "
      >
        {/* Header: Title & Close */}
        <DialogHeader className="flex flex-row items-center justify-between mt-2">
          <DialogTitle className="text-lg font-bold text-brand-primary-900">
            {showQuizPreview ? "Live Exam Preview" : "Quiz Preview"}
          </DialogTitle>
          <Button variant="outline" onClick={onClose}>
            Close preview
          </Button>
        </DialogHeader>

        {/* 4) Üstte cihaz seçimi butonları */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-greyscale-light-800 mr-2">Device:</span>
          <Button
            variant={previewDevice === Device.MOBILE ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeDevice(Device.MOBILE)}
          >
            Mobile
          </Button>
          <Button
            variant={previewDevice === Device.TABLET ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeDevice(Device.TABLET)}
          >
            Tablet
          </Button>
          <Button
            variant={previewDevice === Device.DESKTOP ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeDevice(Device.DESKTOP)}
          >
            Desktop
          </Button>
        </div>

        {/* Bu container ile içerik boyutunu simüle edeceğiz */}
        <div
          className={`
            mt-4 mx-auto border border-greyscale-light-200 shadow-sm bg-base-white relative
            overflow-y-auto overflow-x-hidden
            flex flex-col items-center
            ${previewDevice === Device.MOBILE ? "w-[390px] h-[844px]" : ""}
            ${previewDevice === Device.TABLET ? "w-[768px] h-[1024px]" : ""}
            ${previewDevice === Device.DESKTOP ? "w-[1024px] h-[600px]" : ""}
            rounded-xl
          `}
        >
          {/* EKRAN 1: Start (Quiz) Preview */}
          {!showQuizPreview && (
            <div className="w-full p-0 sm:p-6">
              {/* Üst Kısım: Quiz Başlık + Start Date */}
              <div className="flex flex-col items-center mb-6 mt-2 gap-6">
                <h3
                  className="
                    text-brand-primary-950
                    text-center
                    font-bold
                    mx-auto
                    text-xl sm:text-2xl md:text-3xl
                    whitespace-normal
                    break-normal
                    p-4 gap-3
                    max-w-[90%]
                  "
                >
                  {title || "Untitled Quiz"}
                </h3>

                {/* Start Date */}
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <span className="text-xs sm:text-sm text-greyscale-light-700">
                    Start date:{" "}
                    <span className="font-bold">
                      {startDate ? new Date(startDate).toLocaleString() : "Not set"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Info Box (Type, Total Q, Duration) */}
              <div className="border border-greyscale-light-200 rounded-2xl p-4 bg-white space-y-3 mb-6 sm:mx-10">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5 text-brand-primary-950" />
                  <span className="text-xs sm:text-sm text-greyscale-light-700">
                    Type: <span className="font-bold">Quiz</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Squares2X2Icon className="w-5 h-5 text-brand-primary-950" />
                  <span className="text-xs sm:text-sm text-greyscale-light-700">
                    Total Questions: <span className="font-bold">{questionsCount}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-brand-primary-950" />
                  <span className="text-xs sm:text-sm text-greyscale-light-700">
                    Duration: <span className="font-bold">{numericDuration} minutes</span>
                  </span>
                </div>
              </div>

              {/* Quiz Description (Markdown) */}
              <ReactMarkdown
                className="
                  prose
                  text-sm sm:text-base
                  max-w-full
                  text-greyscale-light-900
                  border
                  border-greyscale-light-200
                  rounded-2xl
                  p-4
                  whitespace-normal
                  break-words
                  overflow-y-auto
                  pb-4
                  h-auto
                  min-h-[120px]
                "
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => (
                    <img {...props} className="max-w-full h-auto" loading="lazy" />
                  ),
                }}
              >
                {description || "No description yet..."}
              </ReactMarkdown>

              {/* "Join quiz" butonu -> LiveExamPreview ekranına geç */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="default"
                  size="default"
                  icon
                  iconPosition="right"
                  onClick={() => setShowQuizPreview(true)}
                >
                  Join quiz
                  <ArrowUpRightIcon className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* EKRAN 2: LiveExamPreview (onGoBack => setShowQuizPreview(false)) */}
          {showQuizPreview && (
            <div className="w-full p-0 sm:p-6">
              <LiveExamPreview
                onGoBack={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
