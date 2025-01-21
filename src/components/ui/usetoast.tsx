import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

// 1) Toast varyantları
type ToastVariant = "default" | "success" | "error" | "warning" | "destructive";

// 2) Toast mesajı özellikleri
interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // otomatik kapanma süresi (ms)
}

// 3) Context içinden expose edilecek metodlar
interface ToastContextProps {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

// 4) Context oluşturma
const ToastContext = createContext<ToastContextProps>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

// 5) ToastProvider bileşeni
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // yeni toast göstermek
  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = new Date().getTime().toString(); // basit unique ID
    setToasts((prev) => [...prev, { id, ...toast }]);
  }, []);

  // toast'ı kapatma / silme fonksiyonu
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <SingleToast
            key={toast.id}
            toast={toast}
            removeToast={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// 6) Tekil Toast bileşeni
function SingleToast({
  toast,
  removeToast,
}: {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}) {
  const { id, title, description, variant = "default", duration = 5000 } = toast;

  // Otomatik kapanma (örn. 5sn)
  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(() => removeToast(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  // Varyanta göre pastel renkler, metin vb.
  // (İsterseniz brand theme değerleriyle değiştirebilirsiniz)
  const variantStyles = {
    default:  "bg-white border border-gray-200 text-gray-700",
    success:  "bg-green-50 border border-green-200 text-green-800",
    error:    "bg-red-50 border border-red-200 text-red-800",
    warning:  "bg-yellow-50 border border-yellow-200 text-yellow-800",
    destructive: "bg-pink-50 border border-pink-200 text-pink-800",
  };

  // Animasyon için basit Tailwind sınıfları:
  // "opacity-0 scale-95" => "opacity-100 scale-100" transition
  return (
    <div
      className={cn(
        "relative flex items-center justify-between p-4 shadow-md rounded-md w-72",
        "transition-all duration-300 ease-out transform",
        "opacity-100 scale-100 hover:scale-[1.02]",
        variantStyles[variant] || variantStyles.default
      )}
    >
      <div className="pr-6">
        {title && <h4 className="font-semibold text-sm">{title}</h4>}
        {description && (
          <p className="text-xs mt-1 opacity-90">{description}</p>
        )}
      </div>
      {/* Kapatma butonu */}
      <button
        onClick={() => removeToast(id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
      >
        x
      </button>
    </div>
  );
}

// 7) useToast hook'u
export function useToast() {
  return useContext(ToastContext);
}
