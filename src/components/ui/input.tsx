import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startElement, endElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {startElement && (
          <span className="absolute left-0 pl-6 text-sm text-muted-foreground flex items-center">
            {startElement}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full pl-4 pr-4 rounded-2xl font-light border border-input bg-base-white text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-brand-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            startElement ? "pl-14" : "",
            endElement ? "pr-14" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {endElement && (
          <span className="absolute right-0 pr-3 text-sm text-muted-foreground flex items-center">
            {endElement}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
