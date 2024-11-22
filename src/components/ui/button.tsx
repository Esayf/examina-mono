import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex box-content items-center gap-2 justify-center whitespace-nowrap text-lg font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border border-solid border-transparent",
  {
    variants: {
      variant: {
        default: "bg-primary border-primary-foreground text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive border-primary-foreground text-destructive-foreground hover:bg-destructive/90",
        outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary border-primary-foreground text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-8 py-2",
        sm: "h-7 px-2 text-sm",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-6 w-6",
      },
      pill: {
        true: "rounded-full",
        false: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: false,
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
