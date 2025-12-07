import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  textarea?: boolean;
  className?: string;
  /** id of an error element to link via aria-describedby */
  errorId?: string;
  /** indicate the input is invalid */
  invalid?: boolean;
};

const baseClass = 'form-input';

export default function Input({ textarea, className = '', errorId, invalid, ...props }: InputProps) {
  const ariaProps: Record<string, any> = {};
  if (invalid) ariaProps['aria-invalid'] = true;
  if (errorId) ariaProps['aria-describedby'] = errorId;

  if (textarea) {
    // @ts-ignore allow textarea props
    const invalidClass = invalid ? 'ring-1 ring-red-200 border-red-400' : '';
    return <textarea className={`${baseClass} ${invalidClass} ${className}`} {...ariaProps} {...(props as any)} />;
  }

  const invalidClass = invalid ? 'ring-1 ring-red-200 border-red-400' : '';
  return <input className={`${baseClass} ${invalidClass} ${className}`} {...ariaProps} {...props} />;
}
