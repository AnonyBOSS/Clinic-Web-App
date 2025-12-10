export default function EmptyState({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-dark-600 bg-slate-50 dark:bg-dark-800/50 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-slate-800 dark:text-white">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}
