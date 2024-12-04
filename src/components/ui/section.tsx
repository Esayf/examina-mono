import { cn } from "@/lib/utils";
import styles from "@/styles/Landing.module.css";

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn(styles.section, className)}>{children}</section>;
}