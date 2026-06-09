import Link from "next/link";

type BusitoStatus = "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO";

type BusitoCardProps = {
  id: number;
  name: string;
  description?: string;
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
  status?: BusitoStatus;
  createdAt: string;
  onDelete: (id: number) => Promise<void>;
};

const statusConfig: Record<BusitoStatus, { label: string; classes: string }> = {
  ACTIVO:            { label: "Activo",          classes: "bg-success-100 text-success-700" },
  INACTIVO:          { label: "Inactivo",         classes: "bg-bg text-muted" },
  EN_MANTENIMIENTO:  { label: "En mantenimiento", classes: "bg-brand-100 text-brand-700" },
};

export default function BusitoCard({
  id, name, description, plateNumber, capacity, model, year, status = "ACTIVO", createdAt, onDelete,
}: BusitoCardProps) {
  const cfg = statusConfig[status];

  return (
    <article className="rounded-[10px] border border-border bg-surface flex flex-col transition-colors hover:border-border-2">
      <Link href={`/busitos/${id}`} className="flex-1 p-4 block">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-ink leading-tight">{name}</h3>
          <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
            {cfg.label}
          </span>
        </div>

        {description && (
          <p className="text-sm text-muted line-clamp-2 mb-3">{description}</p>
        )}

        {/* Badges */}
        {(plateNumber || capacity || model || year) && (
          <div className="flex flex-wrap gap-1.5">
            {plateNumber && (
              <span className="rounded bg-bg px-2 py-0.5 text-[11px] text-muted font-medium">
                {plateNumber}
              </span>
            )}
            {model && (
              <span className="rounded bg-bg px-2 py-0.5 text-[11px] text-muted font-medium">
                {model}
              </span>
            )}
            {year && (
              <span className="rounded bg-bg px-2 py-0.5 text-[11px] text-muted font-medium">
                {year}
              </span>
            )}
            {capacity && (
              <span className="rounded bg-bg px-2 py-0.5 text-[11px] text-muted font-medium">
                {capacity} pax
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <span className="text-xs text-faint">
          {new Date(createdAt).toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/busitos/${id}`}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink transition hover:border-border-2 hover:bg-bg"
          >
            Editar
          </Link>
          <button
            onClick={() => void onDelete(id)}
            className="rounded-md border border-danger-100 bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger transition hover:bg-danger-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
