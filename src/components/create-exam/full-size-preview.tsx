"use client";

import React, { useState } from "react";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LiveExamPreview } from "@/components/create-exam/live-exam-preview"; // Kendi yolunuza göre
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

interface FullScreenPreviewProps {
  onClose: () => void; // Overlay’i kapatmak için fonksiyon
  title: string; // Quiz başlığı
  description: string; // Markdown açıklama
  startDate?: string | Date;
  duration?: string; // string olarak geliyorsa parse edeceğiz
  questionsCount?: number; // Toplam soru sayısı
}

export function FullScreenPreview({
  onClose,
  title,
  description,
  startDate,
  duration,
  questionsCount,
}: FullScreenPreviewProps) {
  // false => “Start” ekranı, true => “LiveExamPreview” ekranı
  const [showQuizPreview, setShowQuizPreview] = useState(false);

  // Duration parse
  const numericDuration = duration ? Number(duration) : 120;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60   /* Arka plan karartma */
        p-4
      "
    >
      {/* İçeriği ortalamak için yukarıda flex + items-center + justify-center kullandık */}

      <div
        className="
          relative
          w-full
          max-w-[90vw]
          sm:max-w-[600px]
          md:max-w-[800px]
          lg:max-w-[1280px]
          min-h-[60vh]
          rounded-2xl
          bg-white
          shadow-lg
          flex flex-col
          gap-6
          p-6
        "
      >
        {/* Kapatma Butonu */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            p-3
            rounded-full
            border-2 border-brand-primary-950
            hover:bg-brand-secondary-200
            text-brand-primary-900
            hover:text-brand-primary-950
            transition
          "
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* ===================================
            EKRAN 1: Start (Quiz) Preview
           =================================== */}
        {!showQuizPreview && (
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
              {title || "Untitled Quiz"}
            </h2>

            {/* Start Date */}
            <div className="text-center text-gray-700">
              <span className="text-sm mr-1 font-semibold">Start date:</span>
              <span className="font-medium">
                {startDate ? new Date(startDate).toLocaleString() : "Not set"}
              </span>
            </div>

            {/* Info Box */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> Quiz
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Questions:</strong> {questionsCount ?? 0}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {numericDuration} minutes
              </p>
            </div>

            {/* Description (Markdown) */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white h-auto max-h-[240px] overflow-y-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => (
                    <img {...props} className="max-w-full h-auto" loading="lazy" />
                  ),
                }}
              >
                {description || "No description"}
              </ReactMarkdown>
            </div>

            {/* “Join quiz” butonu */}
            <div className="flex justify-center mt-4">
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

        {/* ===================================
            EKRAN 2: LiveExamPreview
           =================================== */}
        {showQuizPreview && (
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
            {/* “Go Back” butonu */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="icon"
                className="mb-2"
                onClick={() => setShowQuizPreview(false)}
              >
                Go Back
              </Button>
            </div>

            {/* LiveExamPreview içeriği */}
            <div className="flex-1 border border-gray-200 rounded-xl p-4 bg-gray-50">
              {/* Sizin “LiveExamPreview” bileşeniniz, tam akış */}
              <LiveExamPreview
                onGoBack={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
