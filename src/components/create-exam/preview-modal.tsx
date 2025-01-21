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

interface PreviewModalProps {
  open: boolean; // Modal'ın açık/kapalı durumu
  onClose: () => void; // Modal'ı kapatmak için fonksiyon
  title: string; // Quiz Title
  description: string; // Quiz Description (Markdown)
  startDate?: string | Date;
  duration?: string; // Dakika (string olarak geliyorsa parse edeceğiz)
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
  // false = Start (Quiz) Preview, true = LiveExamPreview
  const [showQuizPreview, setShowQuizPreview] = useState(false);

  // Modal her açıldığında "Start Preview" ekranına dönmek için:
  useEffect(() => {
    if (open) {
      // Modal yeni açıldıysa showQuizPreview'ı resetliyoruz
      setShowQuizPreview(false);
    }
  }, [open]);

  // duration string ise sayıya çeviriyoruz
  const numericDuration = duration ? Number(duration) : 120;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <div className={styles.hero_bg}>
        <Image src={BGR} alt="Hero Background" fill className="w-full h-full object-cover" />
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
          pb-16
          px-10
          mt-4
        "
      >
        <DialogHeader className="flex items-center justify-center text-center">
          <DialogTitle className="text-md font-bold text-center">
            {showQuizPreview ? "Live Exam Preview" : "Here’s how your quiz will appear:"}
          </DialogTitle>
        </DialogHeader>

        {/* 
          ---------------------------------------------------------
          EKRAN 1: Start (Quiz) Preview
          ---------------------------------------------------------
        */}
        {!showQuizPreview && (
          <div
            className="
              mx-auto
              border border-greyscale-light-200
              rounded-3xl
              p-6
              whitespace-normal
              break-normal
              overflow-y-auto
              min-h-[400px]
              w-full
              max-w-[90vw]
              sm:max-w-[600px]
              lg:min-w-[880px]
              lg:max-h-[678px]
              shadow-sm
              bg-white
            "
          >
            {/* Üst Kısım: Quiz Başlık + Start Date */}
            <div className="flex flex-col items-center mb-6 mt-6 gap-6">
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
                  max-w-[80vw]
                  sm:max-w-[280px]
                  md:max-w-[480px]
                  lg:max-w-[600px]
                  overflow-auto
                "
              >
                {title || "Untitled Quiz"}
              </h3>

              {/* Start Date */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-greyscale-light-700">
                  Start date:{" "}
                  <span className="font-bold">
                    {startDate ? new Date(startDate).toLocaleString() : "Not set"}
                  </span>
                </span>
              </div>
            </div>

            {/* Info Box (Type, Total Q, Duration) */}
            <div className="border border-greyscale-light-200 rounded-2xl p-4 bg-white space-y-3 mb-6 md:my-6 md:mx-10">
              {/* Type */}
              <div className="flex items-center gap-2">
                <ClipboardDocumentIcon className="w-5 h-5 text-brand-primary-950" />
                <span className="text-sm text-greyscale-light-700">
                  Type: <span className="font-bold">Quiz</span>
                </span>
              </div>

              {/* Total Questions */}
              <div className="flex items-center gap-2">
                <Squares2X2Icon className="w-5 h-5 text-brand-primary-950" />
                <span className="text-sm text-greyscale-light-700">
                  Total Questions: <span className="font-bold">{questionsCount}</span>
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-brand-primary-950" />
                <span className="text-sm text-greyscale-light-700">
                  Duration: <span className="font-bold">{numericDuration} minutes</span>
                </span>
              </div>
            </div>

            {/* Quiz Description (Markdown) */}
            <ReactMarkdown
              className="
                prose
                max-w-full
                text-base
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
                min-h-[160px]
                md:max-h-[220px]
                md:mx-10
              "
              remarkPlugins={[remarkGfm]}
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
                <ArrowUpRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 
          ---------------------------------------------------------
          EKRAN 2: LiveExamPreview (Sınav Gösterimi)
          ---------------------------------------------------------
        */}
        {showQuizPreview && (
          <div
            className="
              mx-auto
              border border-greyscale-light-200
              rounded-3xl
              p-6
              whitespace-normal
              break-normal
              min-h-[400px]
              w-full
              max-w-[90vw]
              sm:max-w-[600px]
              lg:min-w-[880px]
              lg:max-h-[678px]
              shadow-sm
              bg-white
            "
          >
            <LiveExamPreview />
          </div>
        )}

        {/* Close butonu (Modal'ı kapatmak için) */}
        <Button variant="outline" className="mx-auto" onClick={onClose}>
          Close preview
        </Button>
      </DialogContent>
    </Dialog>
  );
}
