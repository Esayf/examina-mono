import React from "react";
import ReactDOM from "react-dom";

export interface RoleSelectionModalProps {
  isOpen: boolean; // Modal açık/kapalı
  onClose: () => void; // Modal'ı kapatma fonksiyonu
  onRoleSelect: (role: "creator" | "joiner") => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Arka plan (overlay) */}
      <div
        className="
          fixed 
          inset-0 
          z-40 
          bg-black/40
          backdrop-blur-sm
        "
        onClick={onClose}
      />

      {/* Modal kutusu */}
      <div
        className="
          fixed 
          inset-0 
          z-50 
          flex 
          items-center 
          justify-center 
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            md:p-8
            relative
          "
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
            Choz your role!
          </h2>

          <p className="mb-6 text-gray-600 text-center">Are you a creator or a joiner?</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => onRoleSelect("joiner")}
              className="
                w-full
                sm:w-auto
                px-5 
                py-3 
                rounded-full 
                bg-gray-200 
                text-gray-800 
                font-medium
                hover:bg-gray-300 
                active:scale-95
                transition
              "
            >
              Joiner
            </button>

            <button
              onClick={() => onRoleSelect("creator")}
              className="
                w-full
                sm:w-auto
                px-5 
                py-3 
                rounded-full 
                bg-blue-600 
                text-white 
                font-medium
                hover:bg-blue-700
                active:scale-95
                transition
              "
            >
              Creator
            </button>
          </div>

          {/* Kapatma ikonu */}
          <button
            onClick={onClose}
            className="
              absolute
              top-3
              right-3
              p-2
              rounded-full
              hover:bg-gray-100
              text-gray-500
              transition
            "
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default RoleSelectionModal;
