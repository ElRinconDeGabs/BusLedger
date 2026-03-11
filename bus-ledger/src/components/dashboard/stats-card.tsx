type StatsCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
};

function Icon({ name }: { name: string }) {
  if (name === "bus") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="13" rx="3" />
        <path d="M7 17v3M17 17v3M4 10h16" />
      </svg>
    );
  }

  if (name === "transactions") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8h12M6 12h12M6 16h7" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    );
  }

  if (name === "income") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20V4M6 10l6-6 6 6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v16M18 14l-6 6-6-6" />
    </svg>
  );
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          <Icon name={icon} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </article>
  );
}
