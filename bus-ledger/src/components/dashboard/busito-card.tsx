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

const statusBadge: Record<BusitoStatus, string> = {
  ACTIVO:           "bg-success-100 text-success-700",
  INACTIVO:         "bg-surface-2 text-muted border border-border",
  EN_MANTENIMIENTO: "bg-warning-100 text-warning-700",
};
const statusLabel: Record<BusitoStatus, string> = {
  ACTIVO:           "Activo",
  INACTIVO:         "Inactivo",
  EN_MANTENIMIENTO: "Mantenimiento",
};

export default function BusitoCard({
  id, name, description, plateNumber, capacity, model, year,
  status = "ACTIVO", createdAt, onDelete,
}: BusitoCardProps) {
  return (
    <article className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden transition-colors hover:border-border-2">
      <Link href={`/busitos/${id}`} className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-ink leading-snug">{name}</h3>
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${statusBadge[status]}`}>
            {statusLabel[status]}
          </span>
        </div>

        {description && (
          <p className="text-sm text-muted line-clamp-2 mb-3">{description}</p>
        )}

        {(plateNumber || model || year || capacity) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {plateNumber && <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">{plateNumber}</span>}
            {model && <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">{model}</span>}
            {year && <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">{year}</span>}
            {capacity && <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-muted">{capacity} pax</span>}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="text-xs text-faint">
          {new Date(createdAt).toLocaleDateString("es-PA", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <div className="flex gap-1.5">
          <Link
            href={`/busitos/${id}`}
            className="rounded border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-border-2 hover:text-ink"
          >
            Editar
          </Link>
          <button
            onClick={() => void onDelete(id)}
            className="rounded border border-danger-100 bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger transition hover:bg-danger-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
