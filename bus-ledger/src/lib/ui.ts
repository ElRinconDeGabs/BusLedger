/** Clases Tailwind reutilizables para garantizar consistencia visual */
export const ui = {
  input:    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100 disabled:bg-surface-2 disabled:text-muted",
  select:   "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100",
  textarea: "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100 resize-none",
  label:    "block text-sm font-medium text-ink mb-1.5",
  labelSm:  "block text-xs font-medium text-muted mb-1",
  btn: {
    primary:   "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60",
    secondary: "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:border-border-2 hover:text-ink disabled:opacity-60",
    danger:    "inline-flex items-center justify-center gap-2 rounded-lg border border-danger-100 bg-danger-50 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger-100 disabled:opacity-60",
    ghost:     "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink",
  },
  card:     "rounded-lg border border-border bg-surface",
  section:  "rounded-lg border border-border bg-surface",
};
