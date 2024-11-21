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
  return (
    <div
      className={`RadioGruopContainer ${
        option.number === choices[currentQuestion.number - 1] && "RadioGroupContainer__active"
      } RadioGruopContainerPreview`}
      onClick={() => {
        const newChoices = [...choices];
        // FIXME: This is a temporary solution. We need to fix this.
        // @ts-ignore
        newChoices[currentQuestion.number - 1] = option.number;
        setChoices(newChoices);
      }}
      style={{ cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <RadioGroup.Item
          className="RadioGroupItem"
          value={option.text}
          checked={currentQuestion.options[index].number === choices[currentQuestion.number - 1]}
        >
          <RadioGroup.Indicator className="RadioGroupIndicator" />
        </RadioGroup.Item>
        <p
          className="RadioText"
          style={{
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
