import React from "react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

/**
 * Örnek "TimeToShareModal" bileşeni
 */
interface TimeToShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeToShareModal: React.FC<TimeToShareModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  if (!isOpen) return null; // Modal kapalıysa hiç render etme

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/30 backdrop-blur-sm
      "
    >
      {/* Kart */}
      <div
        className="
          relative w-full max-w-sm p-6 md:p-8
          bg-white rounded-2xl shadow-lg
          flex flex-col items-center
        "
      >
        {/* Kapatma butonu */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            p-2 rounded-full border border-gray-300
            text-gray-500 hover:text-gray-700
            hover:bg-gray-100 transition
          "
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Büyük onay ikonu */}
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
          </svg>
        </div>

        {/* Süs ikonu (küçük elmas) - isteğe bağlı */}
        {/* Örneğin: <div className="absolute top-16 left-[calc(50%+40px)] text-pink-500">◆</div> */}

        {/* Başlık */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Time to share!</h2>

        {/* Açıklama */}
        <p className="text-center text-gray-600 mb-6 px-2">
          The quiz has been successfully created!
          <br />
          Now you can share your quiz with your participants.
        </p>

        {/* Buton */}
        <Button
          onClick={() => {
            router.push("/app/dashboard/created");
            onClose();
          }}
          variant="default"
        >
          Go to my quizzes
          <ArrowRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
