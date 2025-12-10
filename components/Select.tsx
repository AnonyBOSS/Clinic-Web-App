"use client";

import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`block w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${className ?? ""}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
