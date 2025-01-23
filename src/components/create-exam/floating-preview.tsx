"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Example device frames (adjust sizes as needed)
const DEVICE_CONFIGS = {
  mobile: {
    label: "Mobile (iPhone 12)",
    width: 390,
    height: 844,
  },
  tablet: {
    label: "Tablet (iPad)",
    width: 768,
    height: 1024,
  },
  desktop: {
    label: "Desktop (1280x720)",
    width: 1280,
    height: 720,
  },
};

interface FloatingPreviewProps {
  quizTitle: string;
  quizDescription: string;
  startDate?: string | Date;
  duration?: string;
  questionsCount?: number;
}

/**
 * This component is a floating button that, when clicked, opens a modal
 * showing the quiz preview in three different device frames.
 */
export function FloatingPreview({
  quizTitle,
  quizDescription,
  startDate,
  duration,
  questionsCount,
}: FloatingPreviewProps) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<keyof typeof DEVICE_CONFIGS>("mobile");

  return (
    <>
      {/* 1. Floating Button (always visible, bottom-right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="default" size="sm" onClick={() => setOpen(true)}>
          Open Preview
        </Button>
      </div>

      {/* 2. Dialog / Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            w-full max-w-[90vw]
            min-h-[60vh]
            rounded-2xl
            flex flex-col gap-6
            pb-8 px-4
            overflow-auto
          "
        >
          <DialogHeader className="flex flex-row items-center justify-between mt-2">
            <DialogTitle className="text-lg font-bold">Quiz Preview</DialogTitle>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogHeader>

          {/* 3. Tabs/Buttons to toggle device size */}
          <div className="flex gap-4 mt-2">
            {Object.entries(DEVICE_CONFIGS).map(([key, cfg]) => (
              <Button
                key={key}
                variant={device === key ? "default" : "outline"}
                onClick={() => setDevice(key as keyof typeof DEVICE_CONFIGS)}
              >
                {cfg.label}
              </Button>
            ))}
          </div>

          {/* 4. “Device Frame” Container */}
          <div className="flex justify-center items-center mt-4">
            <div
              className="relative border border-gray-300 shadow-lg"
              style={{
                width: DEVICE_CONFIGS[device].width,
                height: DEVICE_CONFIGS[device].height,
                // optionally scale it down if too large
                // transform: "scale(0.7)",
                // transformOrigin: "top left",
              }}
            >
              {/* 
                This is where you place your actual quiz content. 
                You can embed your existing 'PreviewModal' content,
                or your 'LiveExamPreview', or whatever you want.
              */}
              <QuizPreviewContent
                title={quizTitle}
                description={quizDescription}
                startDate={startDate}
                duration={duration}
                questionsCount={questionsCount}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * A simplified example of the quiz preview.
 * In practice, you might swap this out for your `LiveExamPreview`
 * or the entire “EKRAN 1 & 2” logic from your existing code.
 */
function QuizPreviewContent({
  title,
  description,
  startDate,
  duration,
  questionsCount,
}: {
  title: string;
  description: string;
  startDate?: string | Date;
  duration?: string;
  questionsCount?: number;
}) {
  return (
    <div className="p-4 w-full h-full bg-white">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-sm text-gray-600 mb-2">
        Start date: {startDate ? new Date(startDate).toLocaleString() : "Not set"}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        Duration: <span className="font-bold">{duration || 120}</span> minutes
      </p>
      <p className="text-sm text-gray-600 mb-2">Total Questions: {questionsCount || 0}</p>
      <div className="border rounded p-2 text-sm text-gray-800 mt-3">
        {description || "No description yet..."}
      </div>
      {/* 
        Insert a "Join Quiz" button or any further logic you want here.
      */}
    </div>
  );
}
