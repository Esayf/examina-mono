"use client";

import React from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { QuestionListItem } from "./question-list-item";

/**
 * Sürüklenebilir (sortable) item sarmalayıcısı
 * - "dragHandle" prop’una, only handle area veriyoruz
 */
export const SortableQuestionListItem = ({
  id,
  index,
  onDuplicate,
  ...props
}: Parameters<typeof QuestionListItem>[0] & {
  id: string;
  onDuplicate?: (index: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // Sürükleme style
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // Tüm satır "cursor-pointer" da olabilir, ama
    // asıl sürükleme "dragHandle" alanında "cursor-move".
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionListItem
        index={index}
        {...props}
        // Sürükleme sadece handle alanında:
        dragHandle={
          <div className="p-1 hover:bg-gray-100 rounded-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M5 3.5C5 4.32843 4.32843 5 3.5 5C2.67157 5 2 4.32843 2 3.5C2 2.67157 2.67157 2 3.5 2C4.32843 2 5 2.67157 5 3.5Z"
                fill="currentColor"
              />
              <path
                d="M5 10.5C5 11.3284 4.32843 12 3.5 12C2.67157 12 2 11.3284 2 10.5C2 9.67157 2.67157 9 3.5 9C4.32843 9 5 9.67157 5 10.5Z"
                fill="currentColor"
              />
              <path
                d="M8.5 5C9.32843 5 10 4.32843 10 3.5C10 2.67157 9.32843 2 8.5 2C7.67157 2 7 2.67157 7 3.5C7 4.32843 7.67157 5 8.5 5Z"
                fill="currentColor"
              />
              <path
                d="M10 10.5C10 11.3284 9.32843 12 8.5 12C7.67157 12 7 11.6716 7 10.5C7 9.67157 7.67157 9 8.5 9C9.32843 9 10 9.6716 10 10.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
        }
        onDuplicate={onDuplicate}
      />
    </div>
  );
};
