"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import BusitoCard from "@/components/dashboard/busito-card";
import * as toast from "@/lib/toast";

type BusitoStatus = "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO";

type Busito = {
  id: number;
  name: string;
  description?: string;
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
  status: BusitoStatus;
  createdAt: string;
};

const emptyForm = { name: "", description: "", plateNumber: "", capacity: "", model: "", year: "", status: "ACTIVO" as BusitoStatus };

export default function BusitosPage() {
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { void fetchBusitos(); }, []);

  const fetchBusitos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/busitos");
      if (res.ok) setBusitos((await res.json()) as Busito[]);
    } finally {
      setLoading(false);
    }
  };

  const createBusito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/busitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          plateNumber: form.plateNumber.trim() || null,
          capacity: form.capacity ? Number(form.capacity) : null,
          model: form.model.trim() || null,
          year: form.year ? Number(form.year) : null,
          status: form.status,
        }),
      });
      if (res.ok) {
        toast.success("Busito registrado");
        setForm(emptyForm);
        setShowForm(false);
        await fetchBusitos();
      } else {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al crear");
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteBusito = async (id: number) => {
    if (!confirm("¿Eliminar este busito y todas sus transacciones?")) return;
    const res = await fetch(`/api/busitos/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Busito eliminado"); await fetchBusitos(); }
    else toast.error("Error al eliminar");
  };

  const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100";
  const labelCls = "block text-xs font-medium text-muted mb-1";

  return (
    <DashboardShell title="Busitos" currentPath="/busitos">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Unidades registradas</h2>
          <p className="text-sm text-muted">{busitos.length} busito{busitos.length !== 1 ? "s" : ""} en total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void fetchBusitos()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition hover:text-ink hover:border-border-2"
          >
            Actualizar
          </button>
          <button
            onClick={() => setShowForm((o) => !o)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-900 transition hover:opacity-90"
          >
            {showForm ? "Cancelar" : "Nuevo busito"}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink mb-4">Datos del busito</h3>
          <form onSubmit={createBusito}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <label className={labelCls}>Nombre *</label>
                <input placeholder="Ej: Ruta Centro 12" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Placa</label>
                <input placeholder="Ej: A-123456" value={form.plateNumber} onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BusitoStatus }))} className={inputCls}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="EN_MANTENIMIENTO">En mantenimiento</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Modelo</label>
                <input placeholder="Ej: Hyundai County" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Año</label>
                <input type="number" min={1980} max={2100} placeholder="2018" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Capacidad (pax)</label>
                <input type="number" min={1} placeholder="30" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={labelCls}>Descripción</label>
                <textarea
                  placeholder="Opcional"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inputCls} min-h-[72px] resize-none`}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-900 transition hover:opacity-90 disabled:opacity-60"
              >
                {creating ? "Guardando..." : "Guardar busito"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {busitos.map((b) => (
          <BusitoCard
            key={b.id}
            id={b.id}
            name={b.name}
            description={b.description}
            plateNumber={b.plateNumber}
            capacity={b.capacity}
            model={b.model}
            year={b.year}
            status={b.status}
            createdAt={b.createdAt}
            onDelete={deleteBusito}
          />
        ))}
        {!loading && busitos.length === 0 && (
          <div className="rounded-[10px] border border-dashed border-border bg-surface px-6 py-12 text-center sm:col-span-2 2xl:col-span-3">
            <p className="text-sm text-muted mb-3">Aún no hay busitos registrados.</p>
            <button onClick={() => setShowForm(true)} className="text-sm font-medium text-brand-700 hover:text-brand-900">
              Registrar primer busito
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
