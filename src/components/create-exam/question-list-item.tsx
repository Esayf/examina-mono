import { cn } from "@/lib/utils";
import EraseButton from "../ui/erase-button";

// Ufak kırmızı ünlem (ikon veya basit text)
const ErrorExclamation = () => {
  return (
    <div className="text-ui-error-600 text-lg font-bold">
      !
    </div>
  );
};

interface QuestionListItemProps {
  index: number;
  onClick: () => void;
  isActive: boolean;
  onRemove?: (index: number) => void;
  isIncomplete?: boolean;
  className?: string;
  questionText: string;
}

export const QuestionListItem = ({
  index,
  onClick,
  isActive,
  onRemove,
  isIncomplete,
  className,
  questionText,
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
        isActive
          ? "bg-brand-primary-50 text-brand-primary-600 ring-1 ring-brand-primary-100"
          : "text-greyscale-light-500",
        // Alt çizgi
        "border-b border-greyscale-light-200",
        "hover:bg-brand-primary-50",
        className
      )}
    >
      {/* Solda: Soru metni */}
      <div className="flex flex-col items-start gap-1 min-h-[48px]">
        <span
          className={cn(
            "font-medium text-sm",
            isIncomplete ? "text-ui-error-600" : "text-greyscale-dark"
          )}
        >
          Q{index + 1}
        </span>

        {/* Burada sabit genişlik: w-24 (yaklaşık 6rem).
            text-ellipsis ile taşan kısmı … yapıyoruz.
            overflow-hidden & whitespace-nowrap, metin taşmaması için. */}
        <span
          className={cn(
            "text-sm text-greyscale-light-600",
            "w-24 overflow-hidden whitespace-nowrap text-ellipsis"
          )}
        >
          {truncatedText}
        </span>
      </div>

      {/* Sağda: Sabit genişlikte kapsayıcı -> her zaman w-4 */}
      <div className="ml-2 w-4 h-4 flex items-center justify-center">
        {isIncomplete && <ErrorExclamation />}
      </div>

      {/* Silme butonu */}
      {onRemove && (
        <EraseButton
          onRemove={() => onRemove(index)}
          duration={1500}
          className="ml-2"
        />
      )}
    </button>
  );
};
