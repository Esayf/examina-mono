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
      <div style={{ display: "flex", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <RadioGroup.Item
          className="RadioGroupItem rounded-full bg-base-white border border-greyscale-light-300 w-6 h-6 mr-2 hover:bg-brand-primary-100 selection:bg-brand-primary-100"
          value={String(option.number)}
          id={`option-${option.number}`}
          checked={option.number === choices[currentQuestion.number - 1]}
          onClick={(e) => e.stopPropagation()}
        >
          <RadioGroup.Indicator className="RadioGroupIndicator" />
        </RadioGroup.Item>
        <p
          className="RadioText"
          style={{
            backgroundColor: "white",
            padding: "1rem",
            border: "1px solid #e0e0e0",
            marginBottom: "1rem",
            width: "100%",
            height: "100%",
            alignItems: "center",
            borderRadius: "64px",
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
