import { cn } from "@/lib/utils";
import EraseButton from "../ui/erase-button";
import { Button } from "@/components/ui/button";
import {
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Ufak kırmızı ünlem (ikon veya basit text)
const ErrorExclamation = () => {
  return <div className="text-ui-error-600 text-lg font-bold">!</div>;
};

interface QuestionListItemProps {
  index: number;
  isActive: boolean;
  onRemove?: (index: number) => void;
  isIncomplete?: boolean;
  className?: string;
  questionText: string;

  // Yeni eklenen props
  isFirst: boolean;
  isLast: boolean;
  move: (index: number, indexB: number) => void;
  setActiveQuestionIndex: (index: number) => void;
  recentlyAddedIndex: number | null;
}

/**
 * QuestionListItem
 *  - Solda soru sıra numarası + kısaltılmış metin
 *  - Sağda "kırmızı ünlem" (opsiyonel), yukarı/aşağı butonları (opsiyonel), silme butonu (opsiyonel)
 *  - Tüm satır bir <button>, tıklayınca `onClick`.
 */
export const QuestionListItem = ({
  index,
  isActive,
  onRemove,
  isIncomplete,
  questionText,
  isFirst,
  isLast,
  move,
  setActiveQuestionIndex,
  recentlyAddedIndex,
}: QuestionListItemProps) => {
  // Metni 11 karakterle kısaltma (isterseniz tamamen kaldırabilirsiniz)
  const truncatedText =
    questionText.length > 11
      ? `${questionText.slice(0, 11)}...`
      : questionText || "No content!";

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => setActiveQuestionIndex(index)}
        className={cn(
          "relative flex justify-between items-center px-5 py-2 w-full min-h-[48px]",
          "transition-all duration-200 hover:scale-[1.01] rounded-sm text-left",
          // Aktif olduğunda
          isActive ? "bg-brand-secondary-50 text-brand-primary-800" : "text-greyscale-light-500",
          // Alt çizgi
          "border-b border-brand-secondary-100",
          "hover:bg-brand-secondary-50",
          "flex-1"
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

          {/* Silme butonu (EraseButton) */}
          {onRemove && (
            <EraseButton onRemove={() => onRemove(index)} duration={1500} className="inline-block" />
          )}
        </div>
      </button>
      <div className="flex">
        <Button
          variant="ghost"
          size="chevron"
          disabled={isFirst} // ilk sorudaysa yukarı gidemez
          onClick={(e) => {
            e.stopPropagation();
            if (!isFirst) {
              move(index, index - 1);
              setActiveQuestionIndex(index - 1);
            }
          }}
        >
          <ChevronUpIcon className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="chevron"
          disabled={isLast} // son sorudaysa aşağı gidemez
          onClick={(e) => {
            e.stopPropagation();
            if (!isLast) {
              move(index, index + 1);
              setActiveQuestionIndex(index + 1);
            }
          }}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </div>
      {recentlyAddedIndex === index && (
        <div className="absolute -top-4 left-0 bg-green-100 text-green-800 text-xs py-1 px-2 rounded shadow">
          New question added!
        </div>
      )}
    </div>
  );
};
