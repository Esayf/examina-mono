import { Dispatch, SetStateAction } from "react";
import { QuestionDocument } from "@/lib/Client/Exam";
import { Button, ButtonProps } from "@/components/ui/button";

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
      <div className="flex items-center gap-2 max-w-[160px] md:max-w-full overflow-x-auto">
        {questions.map((el, index) => {
          // Bu soru aktif mi?
          const isActive = el.number === currentQuestion?.number;
          // Bu soru cevaplanmış mı?
          const isAnswered = choices ? choices[index] !== 0 : false;

          /**
           * Renkleri tanımladığımız bir değişken:
           * Aktif soru: "bg-brand-primary-600 text-white"
           * Cevaplanmış soru: "bg-brand-primary-400 text-white"
           * Cevaplanmamış soru: "bg-gray-100 text-gray-600 hover:bg-gray-200"
           */
          let customStyles = "bg-base-white text-brand-primary-950 hover:bg-brand-secondary-50"; // default (cevaplanmamış)
          if (isActive) {
            customStyles =
              "bg-brand-primary-900 text-brand-secondary-200 hover:bg-brand-primary-800";
          } else if (isAnswered) {
            customStyles = "bg-brand-primary-300 text-brand-primary-950 hover:bg-brand-primary-300";
          }

          return (
            <Button
              key={index}
              pill
              {...ButtonProps}
              // Button'ın variant yerine kendi Tailwind class'ımızı ekliyoruz
              className={`text-xl transition-all duration-200 ease-in hover:scale-[0.95] active:scale-95 ${customStyles}`}
              size="icon"
              disabled={isPending} // isterseniz devre dışı bırakabilirsiniz
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
