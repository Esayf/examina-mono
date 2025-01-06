import { cn } from "@/lib/utils";
import React from "react";

export const Spinner = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      d="m1,12C1,5.92,5.92,1,12,1"
      fill="none"
      stroke="currentColor"
      strokeMiterlimit="10"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
