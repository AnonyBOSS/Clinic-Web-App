import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Emoji or icon to display above the title */
  icon?: ReactNode;
  /** Label for optional action button */
  actionLabel?: string;
  /** Callback when action button is clicked */
  onAction?: () => void;
  /** Use compact padding for inline/nested usage */
  compact?: boolean;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-200 dark:border-dark-600 bg-slate-50 dark:bg-dark-800/50 text-center ${compact ? "px-4 py-5" : "px-6 py-8"
        }`}
    >
      {icon && <div className="mb-3 text-3xl">{icon}</div>}
      <p className="text-sm font-semibold text-slate-800 dark:text-white">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
