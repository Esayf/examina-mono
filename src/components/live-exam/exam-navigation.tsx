import { Dispatch, SetStateAction } from "react";
import { QuestionDocument } from "@/lib/Client/Exam";
import { Button, ButtonProps } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface ExamNavigationProps {
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  isPending: boolean;
  currentQuestionIndex: number;
  questions: QuestionDocument[];
  currentQuestion: QuestionDocument | undefined;
  className?: string;
  ButtonProps?: ButtonProps;
}

export const ExamNavigation = ({
  setCurrentQuestionIndex,
  isPending,
  currentQuestionIndex,
  questions,
  currentQuestion,
  className,
  ButtonProps,
}: ExamNavigationProps) => {
  return (
    <div className="flex gap-4 justify-center flex-row">
      <div className="flex items-center gap-2 max-w-[160px] md:max-w-full overflow-x-auto">
        {questions.map((el, index) => {
          const isActive = el.number === currentQuestion?.number;
          return (
            <Button
              key={index}
              pill
              {...ButtonProps}
              className="text-xl transition-all duration-200 ease-in hover:scale-[0.95] active:scale-95"
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
