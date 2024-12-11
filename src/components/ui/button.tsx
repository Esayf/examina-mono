import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const buttonVariants = cva(
  "inline-flex items-center justify-center box-border text-medium font-base whitespace-nowrap transition-colors rounded-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary-400 text-brand-primary-950 border-2 border-brand-primary-950 hover:bg-brand-primary-300 disabled:bg-greyscale-light-200 disabled:text-greyscale-light-400 disabled:border-greyscale-light-300",
        outline:
          "bg-transparent text-brand-primary-950 border-2 border-brand-primary-950 hover:bg-brand-primary-200 hover:text-brand-primary-950 disabled:bg-greyscale-light-100 disabled:text-greyscale-light-300 disabled:border-greyscale-light-300 disabled:stroke-greyscale-light-300",
        secondary:
          "bg-brand-secondary-500 text-base-white hover:bg-brand-secondary-600",
        destructive:
          "bg-ui-error-500 text-ui-error-950 border-2 border-ui-error-950 hover:bg-ui-error-400 disabled:bg-greyscale-light-300 disabled:text-greyscale-light-400 disabled:border disabled:border-greyscale-light-400",
        ghost:
          "bg-transparent text-brand-primary-950 hover:bg-brand-primary-100 hover:text-brand-primary-600 disabled:text-greyscale-light-400 active:bg-brand-primary-100",
        link:
          "text-brand-primary-950 underline-offset-4 hover:bg-brand-primary-200 active:bg-brand-secondary-200 disabled:bg-transparent disabled:text-greyscale-light-400",
        "date-picker":
          "flex border-box items-center justify-between rounded-2xl border border-input bg-background text-md text-brand-primary-950 font-light focus:outline-none focus:ring-2 focus:ring-brand-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:border-greyscale-light-400",
      },
      size: {
        sm: "h-8 px-3 py-1.5 border-2 text-xs leading-2",
        default: "h-13 px-6 py-3",
        lg: "h-15 px-8 py-4 text-lg",
        date: "max-h-[34px] h-[34px] leading-[34px] w-[48px] text-sm caret-auto text-center p-0 bg-brand-primary-400 text-brand-primary-950 border border-brand-primary-950 hover:bg-brand-primary-300 hover:border-brand-primary-950 cursor-pointer",
        icon: "h-13 max-w-[52px] min-w-[52px]",
        "icon-sm": "h-8 w-8",
        "date-picker": "w-full max-h-[48px] min-h-[48px] pl-4 pr-4 py-2",
      },
      pill: {
        true: "rounded-full",
        false: "rounded-md",
      },
      icon: {
        false: "gap-0",
        true: "gap-2",
      },
      iconPosition: {
        left: "pl-5",
        right: "pr-5",
        only: "gap-0",
      },
      iconSize: {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
      },
      isSelected: {
        true: "bg-brand-primary-100",
        false: "",
      },
      isActive: {
        true: "bg-brand-primary-100",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: true,
      icon: false,
    },
  }
);

/*"inline-flex items-center justify-center box-border text-base font-medium whitespace-nowrap transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
{
  variants: {
    variant: {
      default:
        "bg-brand-primary-500 text-white border border-transparent hover:bg-brand-primary-400 focus-visible:ring-brand-primary-400 disabled:bg-greyscale-light-300",
      outline:
        "bg-transparent text-brand-primary-500 border border-brand-primary-500 hover:bg-brand-primary-100 focus-visible:ring-brand-primary-500 disabled:text-greyscale-light-400 disabled:border-greyscale-light-300",
      secondary:
        "bg-brand-secondary-500 text-white hover:bg-brand-secondary-400 focus-visible:ring-brand-secondary-400",
      destructive:
        "bg-red-500 text-white border border-red-600 hover:bg-red-400 focus-visible:ring-red-500",
      ghost:
        "bg-transparent text-brand-primary-500 hover:bg-brand-primary-100 focus-visible:ring-brand-primary-400 disabled:text-greyscale-light-400",
      link: "text-brand-primary-500 underline-offset-4 hover:underline hover:bg-brand-primary-50 focus-visible:ring-brand-primary-400",
      success:
        "bg-success-500 text-white border border-success-600 hover:bg-success-400 focus-visible:ring-success-500",
    },
    size: {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-5 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      icon: "h-10 w-10 flex items-center justify-center p-0 rounded-full",
    },
    shape: {
      rounded: "rounded-lg",
      pill: "rounded-full",
      square: "rounded-none",
    },
    iconPosition: {
      left: "flex-row gap-2",
      right: "flex-row-reverse gap-2",
      none: "gap-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    shape: "rounded",
    iconPosition: "none",
  },*/
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    pill,
    icon,
    iconPosition,
    iconSize,
    isActive,
    isSelected,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, pill, icon, className, iconPosition, iconSize, isSelected}))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
