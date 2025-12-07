"use client";

import { ReactElement, cloneElement } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helpText?: string;
  children: ReactElement<any>;
}

export default function FormField({
  label,
  htmlFor,
  error,
  helpText,
  children,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const helpId = helpText ? `${htmlFor}-help` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const childWithProps = cloneElement(children, {
    id: htmlFor,
    "aria-invalid": !!error || undefined,
    "aria-describedby": describedBy,
  });

  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      {childWithProps}

      {helpText && !error && (
        <p id={helpId} className="text-xs text-slate-500">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
