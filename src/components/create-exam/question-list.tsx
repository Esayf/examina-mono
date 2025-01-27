import { useEffect } from "react";
import { QuestionListItem } from "@/components/create-exam/question-list-item";
import { FieldArrayWithId, FieldErrors, UseFieldArrayMove } from "react-hook-form";
import { Step1FormValues } from "@/components/create-exam/step1-schema";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";

interface QuestionListProps {
  fields: FieldArrayWithId<Step1FormValues, "questions", "id">[]

  activeQuestionIndex: number,
  setActiveQuestionIndex: (index: number) => void,
  questionRefs: React.RefObject<Record<number, HTMLDivElement | null>>,
  errors: FieldErrors<Step1FormValues>,
  questions: Step1FormValues["questions"],
  remove?: (index: number) => void,
  move: UseFieldArrayMove,
  recentlyAddedIndex: number | null,
  setRecentlyAddedIndex: (index: number | null) => void,
}

const QuestionList = ({
  fields, 
  questions, 
  activeQuestionIndex,
  setActiveQuestionIndex,
  questionRefs,
  errors,
  remove,
  move,
  recentlyAddedIndex,
  setRecentlyAddedIndex,
}: QuestionListProps) => {

  // Sensörleri tanımla
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 2 sn sonra highlight iptal
  useEffect(() => {
    if (recentlyAddedIndex !== null) {
      const timer = setTimeout(() => setRecentlyAddedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedIndex, setRecentlyAddedIndex]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    // fields array'inden indeksleri bulalım
    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      move(oldIndex, newIndex);
      setActiveQuestionIndex(newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
        {fields.map((field, index) => {
          const questionHasError = errors.questions && !!errors.questions[index];
          const isFirst = index === 0;
          const isLast = index === fields.length - 1;

          return (
            <div
              key={field.id}
              className="relative w-full border-b border-brand-secondary-100 last:border-none"
              ref={(el) => {
                if (el && questionRefs.current) questionRefs.current[index] = el;
              }}
            >
              <QuestionListItem
                id={field.id}
                index={index}
                isActive={activeQuestionIndex === index}
                onRemove={fields.length > 1 ? remove : undefined}
                isFirst={isFirst}
                isLast={isLast}
                move={move}
                setActiveQuestionIndex={setActiveQuestionIndex}
                recentlyAddedIndex={recentlyAddedIndex}
                isIncomplete={questionHasError}
                questionText={
                  questions[index]?.question || `Question #${index + 1} (untitled)`
                }
              />
            </div>
          );
        })}
      </SortableContext>
    </DndContext>
  );
};

export default QuestionList;
