"use client";

import React from "react";
import { cn } from "@/lib/utils";
import EraseButton from "../ui/erase-button";
import { DocumentDuplicateIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

// Ufak kırmızı ünlem (ikon veya basit text)
const ErrorExclamation = () => <div className="text-ui-error-600 text-lg font-bold">!</div>;

export interface QuestionListItemProps {
  index: number;
  onClick: () => void;
  isActive: boolean;
  onRemove?: (index: number) => void;
  isIncomplete?: boolean;
  className?: string;
  questionText: string;

  // Drag & Drop handle
  dragHandle?: React.ReactNode;

  // Kopyalama
  onDuplicate?: () => void;
}

/**
 * QuestionListItem
 *  - Sadece `dragHandle` alanında "cursor-move" / "cursor-grab".
 *  - Tüm item tıklanabilir => `onClick`.
 *  - Silme butonu ve "Duplicate" butonu: e.stopPropagation() ile
 *    item onClick'ini engeller.
 */
export function QuestionListItem({
  index,
  onClick,
  isActive,
  onRemove,
  isIncomplete,
  className,
  questionText,
  dragHandle,
  onDuplicate,
}: QuestionListItemProps) {
  // "Untitled" fallback ve kısaltma
  const truncated =
    questionText?.length > 11 ? `${questionText.slice(0, 11)}...` : questionText || "Untitled";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        "group relative flex items-center px-5 py-2 w-full min-h-[56px]",
        "transition-all duration-200 hover:scale-[1.01] rounded-sm text-left",
        // Tüm satır tıklanabilir => pointer
        "cursor-pointer",
        isActive ? "bg-brand-secondary-50 text-brand-primary-800" : "text-greyscale-light-500",
        "border-b border-brand-secondary-100 hover:bg-brand-secondary-50",
        className
      )}
    >
      {/** Sadece drag handle alanı => sürükleme */}
      {dragHandle && <div className="mr-2 flex-shrink-0 drag-handle cursor-move">{dragHandle}</div>}

      {/** İçerik */}
      <div className="flex items-center flex-grow gap-4">
        <div className="flex flex-col items-start gap-1 min-h-[52px]">
          {/* Soru numarası */}
          <span
            className={cn(
              "font-medium text-sm",
              isIncomplete ? "text-ui-error-600" : "text-greyscale-dark"
            )}
          >
            Q{index + 1}
          </span>

          {/* Kısa metin */}
          <span className="text-sm text-greyscale-light-600 w-24 overflow-hidden whitespace-nowrap text-ellipsis">
            {truncated}
          </span>
        </div>

        {/* Ünlem + Duplicate */}
        <div className="flex items-center gap-2">
          {isIncomplete && (
            <div className="w-4 h-4 flex items-center justify-center">
              <ErrorExclamation />
            </div>
          )}
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Silme butonu */}
      {onRemove && (
        <div className="relative group inline-block">
          <Button
            size="icon-sm"
            variant="ghost"
            className="group-hover:text-ui-error-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Are you sure you want to delete this question?")) {
                onRemove(index);
              }
            }}
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
