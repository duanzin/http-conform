type MonitorPageHeaderProps = {
  title: string;
  description: string;
};

export function MonitorPageHeader({ title, description }: MonitorPageHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </header>
  );
}
