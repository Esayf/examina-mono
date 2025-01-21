"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button"; // Sizin buton bileşeniniz
import { XMarkIcon } from "@heroicons/react/24/outline"; // Kapatma ikonu (opsiyonel)

interface ExamPreviewModalProps {
  content: string;
  onClose: () => void;
}

/**
 * Bu modal içinde, 'sınav' stiline yakın
 * bir CSS veya tailwind class'ı kullanabilirsiniz.
 */
export function ExamPreviewModal({ content, onClose }: ExamPreviewModalProps) {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
      "
    >
      {/* İç Box */}
      <div
        className="
          relative
          w-full
          max-w-2xl
          bg-white
          rounded-md
          p-4
          shadow-lg
          exam-preview
        "
      >
        {/* Kapatma butonu (sağ üst) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 border border-brand-primary-950 rounded-full p-4 hover:text-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Exam-like Preview</h2>

        {/* 
          1) react-markdown ile parse
          2) remarkGfm ile listeler, tablolar vb. GFM özellikleri aktif
          3) "exam-preview" class'ı ekleyip "sınav stili"ne yakın CSS uygulayabilirsiniz
        */}
        <div className="prose max-w-none exam-preview-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {/* Alt tarafta kapatma / done */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
