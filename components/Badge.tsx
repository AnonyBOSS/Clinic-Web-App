import React from 'react';

type BadgeVariant = 'gray' | 'green' | 'red' | 'indigo';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export default function Badge({ children, variant = 'gray', className = '', ...props }: BadgeProps) {
  const color =
    variant === 'green'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : variant === 'red'
      ? 'bg-red-100 text-red-800 border border-red-200'
      : variant === 'indigo'
      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
      : 'bg-slate-100 text-slate-800 border border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${color} ${className}`} {...props}>
      {children}
    </span>
  );
}
