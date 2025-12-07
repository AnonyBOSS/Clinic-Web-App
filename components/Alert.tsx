import React from 'react';

export default function Alert({
  type = 'info',
  children,
}: {
  type?: 'info' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}) {
  const classes =
    type === 'success'
      ? 'bg-green-50 text-green-800 border border-green-100'
      : type === 'error'
      ? 'bg-red-50 text-red-800 border border-red-100'
      : type === 'warning'
      ? 'bg-yellow-50 text-yellow-800 border border-yellow-100'
      : 'bg-blue-50 text-blue-800 border border-blue-100';

  const icon =
    type === 'success' ? '✅' : type === 'error' ? '⚠️' : type === 'warning' ? '⚠️' : 'ℹ️';

  return (
    <div role="alert" className={`p-3 rounded-md ${classes} flex items-start gap-3`}>
      <div className="text-lg pt-0.5" aria-hidden>{icon}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
