import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startElement, endElement, onKeyDown, onChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {startElement && (
          <span className="absolute left-0 pl-4 pr-4 pt-2 pb-2 text-sm text-greyscale-light-400 flex items-center">
            {startElement}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full pl-4 pr-4 rounded-2xl font-light border border-greyscale-light-200 bg-base-white text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-greyscale-light-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-brand-primary-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            startElement ? "pl-14" : "",
            endElement ? "pr-14" : "",
            className
          )}
          ref={ref}
          {...props}
          onKeyDown={onKeyDown}
          onChange={onChange}
        />
        {endElement && (
          <span className="absolute right-0 pr-3 text-sm text-greyscale-light-400 flex items-center">
            {endElement}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
