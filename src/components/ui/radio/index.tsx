import { forwardRef } from "react";
import classNames from "classnames";

import styles from "./radio.module.css";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ className, ...props }, ref) => {
  return (
    <input className={classNames(styles.radio, className)} ref={ref} type="radio" {...props} />
  );
});

Radio.displayName = "Radio";
