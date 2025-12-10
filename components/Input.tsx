"use client";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`block w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
