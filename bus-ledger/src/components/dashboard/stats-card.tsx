type Variant = "default" | "success" | "danger" | "brand" | "warning";

type StatsCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: "bus" | "transactions" | "income" | "expense" | "balance";
  variant?: Variant;
};

const styles: Record<Variant, { wrap: string; iconWrap: string; title: string; value: string }> = {
  default:  { wrap: "bg-surface border-border",     iconWrap: "bg-surface-2 text-muted",       title: "text-muted",       value: "text-ink" },
  success:  { wrap: "bg-success-50 border-success-100", iconWrap: "bg-success-100 text-success-700", title: "text-success-700", value: "text-success-700" },
  danger:   { wrap: "bg-danger-50 border-danger-100",   iconWrap: "bg-danger-100 text-danger-700",   title: "text-danger-700",  value: "text-danger-700" },
  brand:    { wrap: "bg-brand-50 border-brand-200",     iconWrap: "bg-brand-100 text-brand-700",     title: "text-brand-700",   value: "text-brand-600" },
  warning:  { wrap: "bg-warning-50 border-warning-100", iconWrap: "bg-warning-100 text-warning-700", title: "text-warning-700", value: "text-warning-700" },
};

function Icon({ name }: { name: StatsCardProps["icon"] }) {
  const cls = "h-5 w-5";
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "bus") return (
    <svg viewBox="0 0 20 20" className={cls} {...s}>
      <rect x="3" y="2.5" width="14" height="11" rx="2.5" /><path d="M6 13.5v3M14 13.5v3M3 8.5h14" />
      <circle cx="6.5" cy="16.5" r="1" fill="currentColor" stroke="none" /><circle cx="13.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
  if (name === "income") return (
    <svg viewBox="0 0 20 20" className={cls} {...s}>
      <path d="M10 17V4M5 9l5-5 5 5" />
    </svg>
  );
  if (name === "expense") return (
    <svg viewBox="0 0 20 20" className={cls} {...s}>
      <path d="M10 4v13M15 12l-5 5-5-5" />
    </svg>
  );
  if (name === "balance") return (
    <svg viewBox="0 0 20 20" className={cls} {...s}>
      <path d="M10 2v16M14 5H8.5a3 3 0 0 0 0 6h3a3 3 0 0 1 0 6H5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 20 20" className={cls} {...s}>
      <rect x="2" y="3" width="16" height="14" rx="2" /><path d="M6 7h8M6 10h8M6 13h4" />
    </svg>
  );
}

export default function StatsCard({ title, value, subtitle, icon, variant = "default" }: StatsCardProps) {
  const s = styles[variant];
  return (
    <article className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${s.wrap}`}>
      <div className="min-w-0">
        <p className={`text-xs font-medium ${s.title}`}>{title}</p>
        <p className={`mt-1.5 text-2xl font-bold tabular-nums leading-none ${s.value}`}>{value}</p>
        {subtitle && <p className={`mt-1 text-xs ${s.title} opacity-75`}>{subtitle}</p>}
      </div>
      <div className={`shrink-0 rounded-lg p-2.5 ${s.iconWrap}`}>
        <Icon name={icon} />
      </div>
    </article>
  );
}
