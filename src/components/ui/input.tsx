import * as React from "react";
import { cn } from "@/lib/utils";

export interface BaseInputProps {
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  as?: "input" | "textarea";
  rows?: number;
  className?: string;
}

export type InputProps = BaseInputProps &
  (React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>);

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, startElement, endElement, as = "input", rows, ...props }, ref) => {
    /** Ortak base CSS sınıfları, hem input hem de textarea için benzer görünüm */
    const baseClass = cn(
      "w-full px-2 py-2", // iç boşluklar
      "rounded-2xl border border-greyscale-light-200", // kenarlık
      "bg-base-white ring-offset-background", // arkaplan
      "placeholder:text-greyscale-light-400", // placeholder rengi
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-brand-primary-700 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "resize-none",
      "w-full",
      "min-w-[39rem]",
      "min-h-[3rem]",
      "max-h-[6rem]",
      "text-base",
      "font-light",
      "items-center",
      "justify-center",
      className
    );

    return (
      <div className="relative flex w-full">
        {/* Başlangıç ikonu */}
        {startElement && (
          <span className="absolute left-3 top-9 flex items-center">{startElement}</span>
        )}

        {/* as="textarea" ise çok satırlı; yoksa normal input */}
        {as === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={baseClass}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={cn(baseClass, "flex-1")}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Bitiş ikonu */}
        {endElement && (
          <span className="absolute right-3 top-8 flex items-center">{endElement}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
