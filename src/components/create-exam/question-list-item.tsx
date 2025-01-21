import { cn } from "@/lib/utils";
import EraseButton from "../ui/erase-button";

// Ufak kırmızı ünlem (ikon veya basit text)
const ErrorExclamation = () => {
  return <div className="text-ui-error-600 text-lg font-bold">!</div>;
};

interface QuestionListItemProps {
  index: number;
  onClick: () => void;
  isActive: boolean;
  onRemove?: (index: number) => void;
  isIncomplete?: boolean;
  className?: string;
  questionText: string;

  // Yeni eklenen props (opsiyonel)
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

/**
 * QuestionListItem
 *  - Solda soru sıra numarası + kısaltılmış metin
 *  - Sağda "kırmızı ünlem" (opsiyonel), yukarı/aşağı butonları (opsiyonel), silme butonu (opsiyonel)
 *  - Tüm satır bir <button>, tıklayınca `onClick`.
 */
export const QuestionListItem = ({
  index,
  onClick,
  isActive,
  onRemove,
  isIncomplete,
  className,
  questionText,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: QuestionListItemProps) => {
  // Metni 11 karakterle kısaltma (isterseniz tamamen kaldırabilirsiniz)
  const truncatedText =
    questionText && questionText.length > 11
      ? `${questionText.slice(0, 11)}...`
      : questionText || "No content!";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex justify-between items-center px-5 py-2 w-full min-h-[48px]",
        "transition-all duration-200 hover:scale-[1.01] rounded-sm text-left",
        // Aktif olduğunda
        isActive ? "bg-brand-secondary-50 text-brand-primary-800" : "text-greyscale-light-500",
        // Alt çizgi
        "border-b border-brand-secondary-100",
        "hover:bg-brand-secondary-50",
        className
      )}
    >
      {/* SOLDaki kısım: Soru No + kısaltılmış metin */}
      <div className="flex flex-col items-start gap-1 min-h-[48px]">
        <span
          className={cn(
            "font-medium text-sm",
            isIncomplete ? "text-ui-error-600" : "text-greyscale-dark"
          )}
        >
          Q{index + 1}
        </span>

        {/* Text: sabit genişlik verip overflow ellipsis */}
        <span
          className={cn(
            "text-sm text-greyscale-light-600",
            "w-24 overflow-hidden whitespace-nowrap text-ellipsis"
          )}
        >
          {truncatedText}
        </span>
      </div>

      {/* SAĞdaki kısım: ünlem, yukarı/aşağı butonlar, erase butonu */}
      <div className="ml-auto flex items-center gap-2">
        {/* Kırmızı ünlem -> isIncomplete */}
        {isIncomplete && (
          <div className="w-4 h-4 flex items-center justify-center">
            <ErrorExclamation />
          </div>
        )}

        {/* Yukarı/Aşağı butonları (opsiyonel) */}
        {canMoveUp && onMoveUp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            className="hover:bg-greyscale-light-100 p-1 rounded"
          >
            {/* HeroIcons vs. */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {canMoveDown && onMoveDown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            className="hover:bg-greyscale-light-100 p-1 rounded"
          >
            {/* HeroIcons vs. */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Silme butonu (EraseButton) */}
        {onRemove && (
          <EraseButton onRemove={() => onRemove(index)} duration={1500} className="inline-block" />
        )}
      </div>
    </button>
  );
};
