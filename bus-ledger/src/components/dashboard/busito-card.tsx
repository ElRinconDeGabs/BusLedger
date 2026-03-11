import Link from "next/link";

type BusitoCardProps = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  onDelete: (id: number) => Promise<void>;
};

export default function BusitoCard({ id, name, description, createdAt, onDelete }: BusitoCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/busitos/${id}`} className="block rounded-xl transition hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-blue-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
            <p className="mt-1 min-h-10 text-sm text-slate-500">{description || "Sin descripcion"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">Movimientos</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Creado: {new Date(createdAt).toLocaleDateString()}</p>
          <span className="text-xs font-medium text-slate-500">Abrir detalle</span>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/busitos/${id}`}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
        >
          Editar
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
