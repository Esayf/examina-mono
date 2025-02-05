import * as React from "react";
import { cn } from "@/lib/utils";
// cn fonksiyonu Tailwind class'larını birleştiren yardımcı bir fonksiyondur (opsiyonel).
// Eğer yoksa, className string'lerini kendiniz birleştirebilirsiniz.

type DropdownContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
};

// Menünün durumunu yönetmek için bir context
const DropdownContext = React.createContext<DropdownContextValue | null>(null);

/**
 * Ana sarmalayıcı bileşen.
 */
export function DropdownMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </DropdownContext.Provider>
  );
}

/**
 * Dropdown'u tetikleyecek buton veya öğe.
 */
export function DropdownMenuTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode;
  /** asChild=true ise, bir <button> sarmalamak yerine,
   *  doğrudan çocuk öğenin onClick'e tepki vermesini sağlar (opsiyonel).
   */
  asChild?: boolean;
  className?: string;
}) {
  const context = React.useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenuTrigger must be used inside a <DropdownMenu>.");
  }

  const handleToggle = () => {
    context.setOpen((prev) => !prev);
  };

  if (asChild) {
    // asChild=true ise doğrudan çocuğun onClick vs. event'lerini kullanın
    return (
      <div onClick={handleToggle} style={{ display: "inline-block" }}>
        {children}
      </div>
    );
  }

  // asChild=false ise, çocukları bir <button> içine sar
  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}

/**
 * Açılır menünün içeriğini (menu items) tutan bileşen.
 */
export function DropdownMenuContent({
  children,
  align = "start",
  className,
}: {
  children: React.ReactNode;
  /**
   * "start" → soldan hizalı,
   * "end"   → sağdan hizalı
   */
  align?: "start" | "end";
  className?: string;
}) {
  const context = React.useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenuContent must be used inside a <DropdownMenu>.");
  }

  if (!context.open) {
    // Menü kapalıysa hiçbir şey render etme
    return null;
  }

  return (
    <div
      className={cn(
        // "absolute" konum, menüyü tetikleyen butona göre konumlamak için
        "absolute z-50",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      <div
        className="
          min-w-[180px]
          rounded-xl 
          border border-greyscale-light-200 
          bg-white 
          py-2
          shadow-md
        "
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Menü içindeki her bir tıklanabilir öğe (Item).
 */
export function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const context = React.useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenuItem must be used inside a <DropdownMenu>.");
  }

  const handleClick = () => {
    // Tıklanınca menüyü otomatik kapatmak istiyorsanız:
    context.setOpen(false);

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        `
        px-4 py-3 
        text-base text-brand-primary-950 
        hover:bg-greyscale-light-50
        cursor-pointer 
        whitespace-nowrap
        transition-colors
        `,
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
