import Link from "next/link";

type BusitoCardProps = {
  id: number;
  name: string;
  description?: string;
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
  createdAt: string;
  onDelete: (id: number) => Promise<void>;
};

export default function BusitoCard({ id, name, description, plateNumber, capacity, model, year, createdAt, onDelete }: BusitoCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <Link href={`/busitos/${id}`} className="block rounded-lg px-1 py-0.5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{name}</h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">{description || "Sin descripcion"}</p>
          </div>
          <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">Movs.</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Creado: {new Date(createdAt).toLocaleDateString()}</p>
          <span className="text-xs font-medium text-slate-500">Ver detalle</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
          {plateNumber && <span className="rounded-md bg-slate-100 px-2 py-0.5">Placa: {plateNumber}</span>}
          {capacity && <span className="rounded-md bg-slate-100 px-2 py-0.5">Cap: {capacity}</span>}
          {model && <span className="rounded-md bg-slate-100 px-2 py-0.5">{model}</span>}
          {year && <span className="rounded-md bg-slate-100 px-2 py-0.5">{year}</span>}
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/busitos/${id}`}
          className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
        >
          Editar
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
