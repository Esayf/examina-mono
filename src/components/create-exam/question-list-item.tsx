import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { text } from "stream/consumers";
import EraseButton from "../ui/erase-button";
import { handlePromise } from "@mdxeditor/editor";


const ErrorBadge = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-1 py-0.5 rounded-full bg-ui-error-100 text-xs font-semibold flex-grow-0 text-ui-error-500 flex">{children}</div>
  );
};
  
const handleRemove = () => {
    console.log("Item removed!");
  };
  
interface QuestionListItemProps {
  index: number;
  onClick: () => void;
  isActive: boolean;
  onRemove?: (index: number) => void;
  isIncomplete?: boolean;
}

export const QuestionListItem = ({
  index,
  onClick,
  isActive,
  onRemove,
  isIncomplete,
}: QuestionListItemProps) => {
  return (
    <button
      key={index}
      className={cn(
        isActive ? "bg-brand-primary-50 text-brand-primary-600 border-brand-primary-400 icon-brand-primary-800 min-h-[48px] max-h-[64px]" : "text-greyscale-light-500 border-b border-b-greyscale-light-100 min-h-[48px] max-h-[64px]",
        "flex justify-between px-5 leading-5 py-5 items-center"
      )}
      onClick={onClick}
    >
      Question {index + 1}
      {isIncomplete && <ErrorBadge>check it</ErrorBadge>}
      {onRemove && (
        <EraseButton onRemove={() => onRemove(index)} duration={1500} />
      )}
    </button>
  );
};
