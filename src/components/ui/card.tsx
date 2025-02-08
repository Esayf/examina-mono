import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border border-greyscale-light-200 bg-base-white text-card-foreground shadow-sm rounded-3xl flex flex-col sticky top-0 overflow-x-hidden",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeaderContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 flex-1", className)} {...props} />
  )
);
CardHeaderContent.displayName = "CardHeaderContainer";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-base-white flex items-center justify-between p-5 gap-6 border-b border-b-greyscale-light-200 rounded-t-3xl rounded-b-none sm:rounded-t-3xl font-medium text-base-brand-primary-950",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    const processedChildren =
      typeof children === "string" && children.length > 200
        ? `${children.substring(0, 200)}...`
        : children;

    return (
      <h3
        ref={ref}
        className={cn(
          "text-xl font-semibold max-w-[100vw] leading-tight tracking-tight overflow-y-hidden overflow-x-hidden overflow-wrap break-words",
          className
        )}
        {...props}
      >
        {processedChildren}
      </h3>
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "hidden md:block text-sm font-light text-brand-primary-900 overflow-y-auto overflow-x-hidden overflow-wrap break-words",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("px-5", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center px-5 pb-4 justify-center", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardHeaderContent };
