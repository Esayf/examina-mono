"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { MarkdownEditor } from "@/components/create-exam/markdown";
// ↑ Bu import yolunu kendi proje yapınıza göre ayarlayın

export interface BaseInputProps {
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  as?: "input" | "textarea" | "markdown";
  rows?: number;
  className?: string;
}

// Hem <input> hem de <textarea> prop’larını tek bir tipte topluyoruz
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
      "min-h-[3rem] max-h-[6rem]",
      "text-base font-light items-center justify-center",
      className
    );

    /**
     * Eğer `as="markdown"` ise, MarkdownEditor render ediyoruz.
     * Böylece gelişmiş bir markdown girişi elde ediliyor.
     */
    if (as === "markdown") {
      // MarkdownEditor, normal <input> gibi "value" ve "onChange" beklemez.
      // Bu nedenle props'u "bridge" yaparak aktarıyoruz:
      const { value, onChange, ...rest } =
        props as React.TextareaHTMLAttributes<HTMLTextAreaElement>;

      return (
        <div className="relative flex w-full">
          {/* startElement (sol ikonu) */}
          {startElement && (
            <span className="absolute left-3 top-9 flex items-center">{startElement}</span>
          )}

          <div className={cn(baseClass, "flex-1 w-full max-h-[10rem] py-0 pr-0 rounded-r-2xl")}>
            <MarkdownEditor
              // Burada, props.value ile editördeki içeriği senkronize ediyoruz
              markdown={(value as string) || ""}
              onChange={(md) => {
                /**
                 * MarkdownEditor size doğrudan bir string döndürür.
                 * Onu normal <textarea> onChange gibi sarmak isterseniz,
                 * onChange({ target: { value: md } }) benzeri bir “sentetik” event oluşturabilirsiniz.
                 */
                if (onChange) {
                  // Sentetik Event
                  onChange({
                    target: { value: md },
                  } as React.ChangeEvent<HTMLTextAreaElement>);
                }
              }}
              // Diğer ayarlar
              className="mdxeditor w-full h-full"
              contentEditableClassName="contentEditable"
              placeholder={rest.placeholder as string}
              readOnly={false}
            />
          </div>

          {endElement && (
            <span className="absolute right-3 top-8 flex items-center">{endElement}</span>
          )}
        </div>
      );
    }

    // as="textarea" => klasik çok satırlı Input
    if (as === "textarea") {
      return (
        <div className="relative flex w-full">
          {startElement && (
            <span className="absolute left-3 top-9 flex items-center">{startElement}</span>
          )}
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={baseClass}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
          {endElement && (
            <span className="absolute right-3 top-8 flex items-center">{endElement}</span>
          )}
        </div>
      );
    }

    // Varsayılan => Tek satırlı <input>
    return (
      <div className="relative flex w-full">
        {startElement && (
          <span className="absolute left-3 top-9 flex items-center">{startElement}</span>
        )}
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(baseClass, "flex-1")}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {endElement && (
          <span className="absolute right-3 top-8 flex items-center">{endElement}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
