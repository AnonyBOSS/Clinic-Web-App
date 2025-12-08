export default function PageShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="site-container py-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
