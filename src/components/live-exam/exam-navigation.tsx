import { Dispatch, SetStateAction } from "react";
import { QuestionDocument } from "@/lib/Client/Exam";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExamNavigationProps {
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  isPending: boolean;
  currentQuestionIndex: number;
  questions: QuestionDocument[];
  currentQuestion: QuestionDocument | undefined;
  className?: string;
  ButtonProps?: ButtonProps;
  choices?: number[];
}

export const ExamNavigation = ({
  setCurrentQuestionIndex,
  isPending,
  currentQuestionIndex,
  questions,
  currentQuestion,
  className,
  ButtonProps,
  choices,
}: ExamNavigationProps) => {
  return (
    <div className={`flex gap-4 justify-center flex-row ${className || ""}`}>
      <div className="flex items-center gap-2 max-w-full md:max-w-full">
        {questions.map((el, index) => {
          // Bu soru aktif mi?
          const isActive = el.number === currentQuestion?.number;
          // Bu soru cevaplanmış mı?
          const isAnswered = choices ? choices[index] !== 0 : false;

          const baseStyles = "text-xl !h-12 !w-12";

          const styleVariants = {
            default:
              "bg-base-white text-brand-primary-950 border-2 border-ui-error-500 hover:bg-brand-secondary-100",
            active: "bg-brand-primary-400 text-brand-primary-950 hover:bg-brand-primary-300",
            answered: "bg-brand-primary-900 text-brand-secondary-200 hover:bg-brand-primary-300",
          };

          let customStyles = styleVariants.default;
          if (isActive) {
            customStyles = styleVariants.active;
          } else if (isAnswered) {
            customStyles = styleVariants.answered;
          }

          const getQuestionStatus = () => {
            if (isActive) return "Current question 🟣";
            if (isAnswered) return "Answered ✅";
            return "Not answered ☑️";
          };

          return (
            <TooltipProvider key={index}>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    {...ButtonProps}
                    className={`${baseStyles} ${customStyles}`}
                    size="icon"
                    disabled={isPending}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{getQuestionStatus()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
