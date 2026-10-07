import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-ember text-white shadow-sm hover:bg-ember-dark",
        variant === "secondary" &&
          "border border-line bg-card text-ink hover:bg-paper",
        variant === "ghost" && "text-ink-soft hover:bg-white/50 hover:text-ink",
        variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
