import { Dispatch, SetStateAction } from "react";
import { QuestionDocument } from "@/lib/Client/Exam";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface ExamNavigationProps {
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  isPending: boolean;
  currentQuestionIndex: number;
  questions: QuestionDocument[];
  currentQuestion: QuestionDocument | undefined;
}

export const ExamNavigation = ({
  setCurrentQuestionIndex,
  isPending,
  currentQuestionIndex,
  questions,
  currentQuestion,
}: ExamNavigationProps) => {
  return (
    <div className="flex gap-4 justify-center flex-row overflow-auto flex-1">
      <div className="flex items-center gap-2 max-w-[160px] md:max-w-full overflow-x-auto">
        {questions.map((el, index) => {
          const isActive = el.number === currentQuestion?.number;
          return (
            <Button
              key={index}
              pill
              variant={isActive ? "default" : "outline"}
              size="icon"
              onClick={() => {
                setCurrentQuestionIndex(index);
              }}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
