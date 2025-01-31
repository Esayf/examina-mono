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
  // isOpen false olduğunda DOM'a hiçbir şey ekleme
  if (!isOpen) return null;

  // Modal içeriğini body'e "portallar"
  return ReactDOM.createPortal(
    <>
      {/* Arka plan (overlay) */}
      <div
        className="
          fixed 
          inset-0 
          bg-black 
          bg-opacity-40 
          z-40
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
            bg-white 
            rounded-lg 
            shadow-lg 
            p-6 
            w-full 
            max-w-md
          "
          onClick={(e) => e.stopPropagation()}
          // stopPropagation: Modal üstüne tıklayınca kapanmaması için
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Choz your role!</h2>
          <p className="mb-6 text-gray-600">Are you a creator or a joiner?</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onRoleSelect("joiner")}
              className="
                px-4 
                py-2 
                rounded-md 
                bg-gray-200 
                text-gray-800 
                hover:bg-gray-300 
                transition
              "
            >
              Joiner
            </button>
            <button
              onClick={() => onRoleSelect("creator")}
              className="
                px-4 
                py-2 
                rounded-md 
                bg-blue-600 
                text-white 
                hover:bg-blue-700 
                transition
              "
            >
              Creator
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body // Portal hedefi: body
  );
};

export default RoleSelectionModal;
