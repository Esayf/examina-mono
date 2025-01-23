import { cn } from "@/lib/utils";
import EraseButton from "../ui/erase-button";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

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
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

/**
 * QuestionListItem
 *  - Eski “px-5 py-2 w-full” layout
 *  - Hover’da hafif scale efekti
 *  - Eksikse kırmızı ünlem
 *  - Yukarı / Aşağı oklar “stopPropagation”
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
}: QuestionListItemProps) {
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

        {/* Yukarı buton */}
        {canMoveUp && onMoveUp && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            className="p-1 rounded-full transition-colors duration-200 hover:bg-brand-secondary-200"
            disabled={!canMoveUp}
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
        )}

        {/* Aşağı buton */}
        {canMoveDown && onMoveDown && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            className="p-1 rounded-full transition-colors duration-200 hover:bg-brand-secondary-200"
            disabled={!canMoveDown}
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        )}

        {/* Silme butonu */}
        {onRemove && (
          <EraseButton onRemove={() => onRemove(index)} duration={1500} className="inline-block" />
        )}
      </div>
    </div>
  );
}
