import React from 'react';

export default function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; className?: string }) {
  return (
    <div role="group" className={`card ${className}`} {...props}>{children}</div>
  );
}
