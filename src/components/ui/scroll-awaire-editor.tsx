"use client"; // Next.js 13+ kullanıyorsanız, client bileşeni olduğunu belirtin

import React, { useRef } from "react";
import { MarkdownEditor } from "@/components/create-exam/markdown";
import { Button } from "@/components/ui/button"; // Kendi button bileşeniniz varsa
// vs. importlar…

interface ScrollAwareMarkdownEditorProps {
  markdown: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  className?: string;
  contentEditableClassName?: string;
}

/**
 * Bu bileşen, MarkdownEditor’ı bir <div> içinde sarmalar
 * ve “Scroll to top/bottom” düğmeleri ekleyerek
 * uzun içerikte hızlı gezinme imkanı sunar.
 */
export function ScrollAwareMarkdownEditor({
  markdown,
  onChange,
  readOnly,
  className,
  contentEditableClassName,
}: ScrollAwareMarkdownEditorProps) {
  // 1) Ref ile editör kapsayıcısını yakalıyoruz
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollToBottom = () => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollTo({
        top: editorContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={className}>
      {/* Dilerseniz readOnly değilse butonları gösterin */}
      {!readOnly && (
        <div className="flex gap-2 mb-2">
          <Button variant="outline" onClick={scrollToTop}>
            Scroll to top
          </Button>
          <Button variant="outline" onClick={scrollToBottom}>
            Scroll to bottom
          </Button>
        </div>
      )}

      {/* 2) Editör kapsayıcısı: max-height + overflow-y-auto ile kaydırma alanı */}
      <div
        ref={editorContainerRef}
        className="max-h-[960px] overflow-y-auto border border-gray-200 rounded p-2"
      >
        <MarkdownEditor
          markdown={markdown}
          onChange={onChange}
          readOnly={readOnly}
          contentEditableClassName={contentEditableClassName}
        />
      </div>
    </div>
  );
}
