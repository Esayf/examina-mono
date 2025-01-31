// Radix Primitives
import * as RadioGroup from "@radix-ui/react-radio-group";

// API
import { QuestionDocument } from "@/lib/Client/Exam";

export const Question = ({
  index,
  option,
  choices,
  currentQuestion,
  setChoices,
}: {
  index: number;
  option: QuestionDocument["options"][number];
  choices: number[];
  currentQuestion: QuestionDocument;
  setChoices: (choices: number[]) => void;
}) => {
  const handleSelection = () => {
    const newChoices = [...choices];
    newChoices[currentQuestion.number - 1] = option.number;
    setChoices(newChoices);
  };

  return (
    <div
      className={`RadioGruopContainer ${
        option.number === choices[currentQuestion.number - 1] && "RadioGroupContainer__active"
      } RadioGrupContainerPreview`}
      onClick={handleSelection}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <RadioGroup.Item
          className={`RadioGroupItem rounded-full bg-base-white min-w-[24px] w-6 h-6 mr-2 
            hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${
              option.number === choices[currentQuestion.number - 1]
                ? "border-[3px] border-brand-primary-500 bg-brand-primary-50 shadow-inner scale-[1.02]"
                : "border-2 border-greyscale-light-300 hover:border-brand-primary-300"
            }
            active:scale-95 active:shadow-none relative`}
          value={String(option.number)}
          id={`option-${option.number}`}
          checked={option.number === choices[currentQuestion.number - 1]}
          onClick={handleSelection}
        >
          <RadioGroup.Indicator className="RadioGroupIndicator w-full h-full flex items-center justify-center">
            <div
              className="absolute w-3 h-3 bg-brand-primary-500 rounded-full
              animate-[popIn_300ms_ease-out_forwards]
              before:absolute before:inset-0 before:bg-brand-primary-500/40 before:rounded-full 
              before:animate-[ping_600ms_ease-out_forwards]"
            />
          </RadioGroup.Indicator>
        </RadioGroup.Item>
        <p
          className="RadioText"
          style={{
            padding: "1rem",
            width: "100%",
            height: "100%",
            alignItems: "center",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {option.text}
        </p>
      </div>
    </div>
  );
};
