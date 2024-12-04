import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { text } from "stream/consumers";

const ErrorBadge = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-1 py-0.5 rounded-full bg-ui-error-100 text-xs font-semibold flex-grow-0 text-ui-error-500 flex">{children}</div>
  );
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
        isActive ? "bg-brand-primary-50 text-brand-primary-800 icon-brand-primary-800" : "text-greyscale-light-500",
        "flex justify-between px-6 py-4 items-center"
      )}
      onClick={onClick}
    >
      Question {index + 1}
      {isIncomplete && <ErrorBadge>check it</ErrorBadge>}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(index);
          }}
        >
          <TrashIcon className="size-5" />
        </Button>
      )}
    </button>
  );
};
