type Variant = "neutral" | "success" | "danger" | "brand";

type StatsCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: "bus" | "transactions" | "income" | "expense" | "balance";
  variant?: Variant;
};

const variantStyles: Record<Variant, { card: string; icon: string; label: string; value: string }> = {
  neutral: {
    card:  "border-border bg-surface",
    icon:  "bg-bg text-muted",
    label: "text-muted",
    value: "text-ink",
  },
  success: {
    card:  "border-success-100 bg-success-50",
    icon:  "bg-success-100 text-success-700",
    label: "text-success-700",
    value: "text-success-700",
  },
  danger: {
    card:  "border-danger-100 bg-danger-50",
    icon:  "bg-danger-100 text-danger-700",
    label: "text-danger-700",
    value: "text-danger-700",
  },
  brand: {
    card:  "border-brand-200 bg-brand-50",
    icon:  "bg-brand-100 text-brand-700",
    label: "text-brand-700",
    value: "text-brand-700",
  },
};

function Icon({ name }: { name: StatsCardProps["icon"] }) {
  if (name === "bus") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="14" rx="3" /><path d="M7 17v3M17 17v3M4 10h16" />
      <circle cx="8" cy="20.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="20.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
  if (name === "income") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V4M6 10l6-6 6 6" />
    </svg>
  );
  if (name === "expense") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16M18 14l-6 6-6-6" />
    </svg>
  );
  if (name === "balance") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h5" />
    </svg>
  );
}

export default function StatsCard({ title, value, subtitle, icon, variant = "neutral" }: StatsCardProps) {
  const s = variantStyles[variant];

  return (
    <article className={`rounded-[10px] border p-4 ${s.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-medium ${s.label}`}>{title}</p>
          <p className={`mt-1.5 text-2xl font-bold leading-none tabular-nums ${s.value}`}>{value}</p>
          {subtitle && <p className={`mt-1 text-xs ${s.label} opacity-80`}>{subtitle}</p>}
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${s.icon}`}>
          <Icon name={icon} />
        </div>
      </div>
    </article>
  );
}
