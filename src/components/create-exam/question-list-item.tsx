import { cn } from "@/lib/utils";
import EraseButton from "../ui/erase-button";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

// Ufak kırmızı ünlem (ikon veya basit text)
const ErrorExclamation = () => <div className="text-ui-error-600 text-lg font-bold">!</div>;

interface QuestionListItemProps {
  index: number;
  onClick: () => void;
  isActive: boolean;
  onRemove?: (index: number) => void;
  isIncomplete?: boolean;
  className?: string;
  questionText: string;

  // Yukarı / Aşağı opsiyonları
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;

  // isFirst?: boolean;
  // isLast?: boolean;
  dragHandle?: React.ReactNode;
}

/**
 * QuestionListItem
 *  - Eski "px-5 py-2 w-full" layout
 *  - Hover'da hafif scale efekti
 *  - Eksikse kırmızı ünlem
 *  - Yukarı / Aşağı oklar "stopPropagation"
 *  - Silme butonu
 */
export function QuestionListItem({
  index,
  onClick,
  isActive,
  onRemove,
  isIncomplete,
  questionText,
  className,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  dragHandle,
}: // isFirst?: boolean,
// isLast?: boolean,
QuestionListItemProps) {
  const truncated =
    questionText?.length > 11 ? `${questionText.slice(0, 11)}...` : questionText || "Untitled";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        "group relative flex justify-between items-center px-5 py-2 w-full min-h-[56px]",
        "transition-all duration-200 hover:scale-[1.01] rounded-sm text-left cursor-pointer",
        isActive ? "bg-brand-secondary-50 text-brand-primary-800" : "text-greyscale-light-500",
        "border-b border-brand-secondary-100",
        "hover:bg-brand-secondary-50",
        className
      )}
    >
      {dragHandle && <div className="drag-handle">{dragHandle}</div>}
      {/* SOLDaki kısım: Soru no + kısaltılmış metin */}
      <div className="flex flex-col items-start gap-1 min-h-[52px]">
        <span
          className={cn(
            "font-medium text-sm",
            isIncomplete ? "text-ui-error-600" : "text-greyscale-dark"
          )}
        >
          Q{index + 1}
        </span>

        {/* text */}
        <span className="text-sm text-greyscale-light-600 w-24 overflow-hidden whitespace-nowrap text-ellipsis">
          {truncated}
        </span>
      </div>

      {/* SAĞ kısım: ünlem, yukarı/aşağı, silme */}
      <div className="ml-auto flex items-center gap-2">
        {/* Kırmızı ünlem (eksik) */}
        {isIncomplete && (
          <div className="w-4 h-4 flex items-center justify-center">
            <ErrorExclamation />
          </div>
        )}

        {/* Yukarı buton 
        <Button
          variant="ghost"
          size="chevron"
          className="p-1 hover:bg-brand-secondary-100 rounded-md"
          aria-label="Move question up"
          disabled={canMoveUp === false}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp?.();
          }}
        >
          <ChevronUpIcon className="w-5 h-5 text-greyscale-light-600" />
        </Button>*/}

        {/* Aşağı buton 
        <Button
          variant="ghost"
          size="chevron"
          className="p-1 hover:bg-brand-secondary-100 rounded-md"
          aria-label="Move question down"
          disabled={canMoveDown === false}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown?.();
          }}
        >
          <ChevronDownIcon className="w-5 h-5 text-greyscale-light-600" />
        </Button>*/}

        {/* Silme butonu */}
        {onRemove && (
          <EraseButton
            index={index}
            onRemove={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="inline-block"
          />
        )}
      </div>
    </div>
  );
}
