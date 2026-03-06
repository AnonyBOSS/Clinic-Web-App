interface LoadingSpinnerProps {
  /** Spinner diameter: "sm" (16px), "md" (32px), or "lg" (48px) */
  size?: "sm" | "md" | "lg";
  /** Override the accent color class (default: border-t-indigo-600) */
  color?: string;
  /** Add a text label below the spinner */
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
} as const;

export default function LoadingSpinner({
  size = "md",
  color = "border-t-indigo-600",
  label,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className={`animate-spin rounded-full border-slate-200 dark:border-slate-700 ${sizeClasses[size]} ${color}`}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      )}
    </div>
  );
}
