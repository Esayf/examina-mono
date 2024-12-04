import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const buttonVariants = cva(
  "inline-flex box-content items-center gap-2 justify-center whitespace-nowrap text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border border-solid border-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary-400 text-brand-primary-950 border-2 border-brand-primary-950 hover:bg-brand-primary-300 hover:text-brand-primary-950 hover:border-2 hover:border-brand-primary-950",
        outline:
          "bg-transparent border border-brand-primary-950 text-brand-primary-950 hover:bg-brand-primary-100 hover:text-brand-primary-800 hover:border hover:border-brand-primary-700",
        secondary: "bg-brand-secondary-500 text-base-white hover:bg-brand-secondary-600",
        destructive: "bg-ui-error-500 text-base-white hover:bg-ui-error-600",
        ghost:
          "bg-transparent text-brand-primary-950 hover:bg-brand-primary-100 hover:text-brand-primary-600",
        link: "text-brand-primary-500 underline-offset-4 hover:bg-brand-secondary-200",
      },
      size: {
        sm: "h-6 px-2 text-xs",
        default: "h-auto px-6 py-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-6 w-6",
      },
      pill: {
        true: "rounded-full",
        false: "rounded-md",
      },
      icon: {
        none: "",
        true: "gap-2",
      },
      iconPosition: {
        left: "gap-1",
        right: "gap-2",
      },
      iconSize: {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, pill, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, pill, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
