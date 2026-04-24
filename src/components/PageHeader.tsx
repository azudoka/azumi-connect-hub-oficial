interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="sm:ml-auto flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
