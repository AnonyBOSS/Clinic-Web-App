"use client";

import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "gradient" | "ghost";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  glow?: boolean;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-md hover:shadow-lg",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400",
  outline:
    "border border-slate-300 text-slate-900 bg-white hover:bg-slate-50 focus-visible:ring-slate-400 hover:border-indigo-300",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-md hover:shadow-lg",
  gradient:
    "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 focus-visible:ring-violet-500 shadow-lg hover:shadow-xl",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400"
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 px-2 text-[11px] rounded-md",
  sm: "h-9 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-base rounded-xl",
  xl: "h-12 px-6 text-base rounded-xl"
};

const baseClasses =
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      isLoading = false,
      glow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const glowClass = glow ? "btn-glow" : "";

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          glowClass,
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
