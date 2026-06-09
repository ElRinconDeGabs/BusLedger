"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { ui } from "@/lib/ui";
import * as toast from "@/lib/toast";

type TxType = "INGRESO" | "GASTO";
type BusitoStatus = "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO";
type Tx = { id: number; amount: number; description: string; type: TxType; category?: string; date: string };
type Busito = { id: number; name: string; description?: string; plateNumber?: string; capacity?: number; model?: string; year?: number; status: BusitoStatus; createdAt: string; transactions: Tx[] };

const statusLabel: Record<BusitoStatus, string> = { ACTIVO: "Activo", INACTIVO: "Inactivo", EN_MANTENIMIENTO: "Mantenimiento" };
const statusCls: Record<BusitoStatus, string>   = { ACTIVO: "bg-success-100 text-success-700", INACTIVO: "bg-surface-2 text-muted border border-border", EN_MANTENIMIENTO: "bg-warning-100 text-warning-700" };

export default function BusitoDetailPage() {
  const router = useRouter();
  const settings = useDisplaySettings();
  const { id } = useParams<{ id: string }>();
  const [busito, setBusito] = useState<Busito | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", plateNumber: "", capacity: "", model: "", year: "", status: "ACTIVO" as BusitoStatus });

  useEffect(() => { void load(); }, [id]);

  const load = async () => {
    const res = await fetch(`/api/busitos/${id}`);
    if (!res.ok) { router.push("/busitos"); return; }
    const d = (await res.json()) as Busito;
    setBusito(d);
    setForm({ name: d.name, description: d.description ?? "", plateNumber: d.plateNumber ?? "", capacity: d.capacity ? String(d.capacity) : "", model: d.model ?? "", year: d.year ? String(d.year) : "", status: d.status });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/busitos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacity: form.capacity ? Number(form.capacity) : null, year: form.year ? Number(form.year) : null }) });
      if (res.ok) { toast.success("Cambios guardados"); await load(); }
      else { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Error"); }
    } finally { setSaving(false); }
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const totals = useMemo(() => {
    if (!busito) return { i: 0, g: 0, b: 0 };
    const i = busito.transactions.filter((t) => t.type === "INGRESO").reduce((s, t) => s + t.amount, 0);
    const g = busito.transactions.filter((t) => t.type === "GASTO").reduce((s, t) => s + t.amount, 0);
    return { i, g, b: i - g };
  }, [busito]);

  if (!busito) return (
    <DashboardShell title="Busito" currentPath="/busitos">
      <div className="py-16 text-center text-sm text-muted">Cargando...</div>
    </DashboardShell>
  );

  return (
    <DashboardShell title={busito.name} currentPath="/busitos">
      <div className="space-y-5">
        <Link href="/busitos" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 12L6 8l4-4" /></svg>
          Volver a busitos
        </Link>

        {/* Summary */}
        <div className={ui.card}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-ink">{busito.name}</h1>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusCls[busito.status]}`}>{statusLabel[busito.status]}</span>
            </div>
            <span className="text-sm text-muted">{busito.transactions.length} movimiento{busito.transactions.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-4 text-center">
              <p className="text-xs text-muted mb-1">Ingresos</p>
              <p className="text-lg font-bold tabular-nums text-success-700">{fmt(totals.i)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted mb-1">Gastos</p>
              <p className="text-lg font-bold tabular-nums text-danger">{fmt(totals.g)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted mb-1">Balance</p>
              <p className={`text-lg font-bold tabular-nums ${totals.b >= 0 ? "text-success-700" : "text-danger"}`}>{fmt(totals.b)}</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className={ui.card}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Transacciones</h2>
            <Link href="/transacciones" className="text-xs font-medium text-brand hover:text-brand-600">Ver todas →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Fecha", "Descripción", "Categoría", "Tipo", "Monto"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {busito.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{new Date(tx.date).toLocaleDateString("es-PA")}</td>
                    <td className="px-4 py-3 text-ink">{tx.description}</td>
                    <td className="px-4 py-3 text-xs text-muted">{tx.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${tx.type === "INGRESO" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                        {tx.type === "INGRESO" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold tabular-nums ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                      {tx.type === "INGRESO" ? "+" : "−"}{fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
                {busito.transactions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">Sin transacciones.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit */}
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Editar datos</h2>
          </div>
          <form onSubmit={save} className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><label className={ui.label}>Nombre *</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className={ui.input} /></div>
              <div><label className={ui.label}>Placa</label><input value={form.plateNumber} onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))} placeholder="Opcional" className={ui.input} /></div>
              <div>
                <label className={ui.label}>Estado</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BusitoStatus }))} className={ui.select}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="EN_MANTENIMIENTO">En mantenimiento</option>
                </select>
              </div>
              <div><label className={ui.label}>Modelo</label><input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Opcional" className={ui.input} /></div>
              <div><label className={ui.label}>Año</label><input type="number" min={1980} max={2100} value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="Opcional" className={ui.input} /></div>
              <div><label className={ui.label}>Capacidad (pax)</label><input type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="Opcional" className={ui.input} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><label className={ui.label}>Descripción</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Opcional" className={ui.input} /></div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" disabled={saving} className={ui.btn.primary}>{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
