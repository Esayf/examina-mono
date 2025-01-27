import { QuestionListItem } from "@/components/create-exam/question-list-item";
import { FieldArrayWithId, FieldErrors, UseFieldArrayMove } from "react-hook-form";
import { Step1FormValues } from "@/components/create-exam/step1-schema";
import { useEffect, useState } from "react";

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

  // 2 sn sonra highlight iptal
  useEffect(() => {
    if (recentlyAddedIndex !== null) {
      const timer = setTimeout(() => setRecentlyAddedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedIndex, setRecentlyAddedIndex]);
  
  return (<>
  {fields.map((_, index) => {
    const questionHasError = errors.questions && !!errors.questions[index];

    // Sıra belirleme
    const isFirst = index === 0;
    const isLast = index === fields.length - 1;

    return (
      <div
        key={index}
        className="relative w-full border-b border-brand-secondary-100 last:border-none"
        ref={(el) => {
          if (el && questionRefs.current) questionRefs.current[index] = el;
        }}
      >
      <QuestionListItem
        index={index}
        isActive={activeQuestionIndex === index}
        onRemove={fields.length > 1 ? remove : undefined}
        isFirst={isFirst}
        isLast={isLast}
        move={move}
        setActiveQuestionIndex={setActiveQuestionIndex}
        recentlyAddedIndex={recentlyAddedIndex}
        isIncomplete={questionHasError}
        // ★ No content => "Question #X (untitled)"
        questionText={
          questions[index]?.question || `Question #${index + 1} (untitled)`
        }
      />
      </div>
    );
  })}
  </>);
};

export default QuestionList;
