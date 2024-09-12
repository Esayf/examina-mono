import * as SelectPrimitive from "@radix-ui/react-select";
import { forwardRef } from "react";
import classnames from "classnames";

interface SelectItemProps {
  children: React.ReactNode;
  className?: string;
  value: string;
  disabled?: boolean;
  props?: any;
}

export const SelectItem = forwardRef(
  ({ children, className, value, disabled, ...props }: SelectItemProps, forwardedRef: any) => {
    return (
      <SelectPrimitive.Item
        value={value} // Add the 'value' property here
        className={classnames("SelectItem", className)}
        disabled={disabled}
        {...props}
        ref={forwardedRef}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="SelectItemIndicator" />
      </SelectPrimitive.Item>
    );
  }
);

SelectItem.displayName = "SelectItem";
