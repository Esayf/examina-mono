import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        active: "border-transparent bg-green-50 text-green-500 border border-green-300",
        ended: "border-transparent bg-red-50 text-red-500 border border-red-300",
        upcoming: "border-transparent bg-yellow-50 text-yellow-500 border border-yellow-300",
        secondary:
          "border-transparent bg-brand-secondary-50 text-brand-secondary-950 border border-brand-secondary-300",
        destructive:
          "border-transparent bg-ui-error-50 text-ui-error-950 border border-ui-error-300",
        outline: "text-foreground",
        size: {
          sm: "text-xs",
          md: "text-sm",
          lg: "text-base",
        },
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
