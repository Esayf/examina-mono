import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const ErrorBadge = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-sm bg-red-100 text-xs flex-grow-0 text-red-500 flex">{children}</div>
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
        isActive ? "bg-gray-100" : "text-neutral-500",
        "flex justify-between px-6 py-4 items-center"
      )}
      onClick={onClick}
    >
      Question {index + 1}
      {isIncomplete && <ErrorBadge>not completed</ErrorBadge>}
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
