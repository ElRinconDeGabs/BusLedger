"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import * as toast from "@/lib/toast";

type TxType = "INGRESO" | "GASTO";
type BusitoStatus = "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO";

type Transaction = {
  id: number;
  amount: number;
  description: string;
  type: TxType;
  category?: string;
  date: string;
};

type BusitoDetail = {
  id: number;
  name: string;
  description?: string;
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
  status: BusitoStatus;
  createdAt: string;
  transactions: Transaction[];
};

const statusConfig: Record<BusitoStatus, { label: string; classes: string }> = {
  ACTIVO:           { label: "Activo",          classes: "bg-success-100 text-success-700" },
  INACTIVO:         { label: "Inactivo",         classes: "bg-bg text-muted" },
  EN_MANTENIMIENTO: { label: "En mantenimiento", classes: "bg-brand-100 text-brand-700" },
};

export default function BusitoDetailPage() {
  const router = useRouter();
  const settings = useDisplaySettings();
  const params = useParams<{ id: string }>();
  const [busito, setBusito] = useState<BusitoDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", plateNumber: "", capacity: "",
    model: "", year: "", status: "ACTIVO" as BusitoStatus,
  });

  useEffect(() => { void fetchBusito(); }, [params.id]);

  const fetchBusito = async () => {
    const res = await fetch(`/api/busitos/${params.id}`);
    if (!res.ok) { router.push("/busitos"); return; }
    const data = (await res.json()) as BusitoDetail;
    setBusito(data);
    setForm({
      name: data.name,
      description: data.description ?? "",
      plateNumber: data.plateNumber ?? "",
      capacity: data.capacity ? String(data.capacity) : "",
      model: data.model ?? "",
      year: data.year ? String(data.year) : "",
      status: data.status,
    });
  };

  const saveBusito = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/busitos/${params.id}`, {
        method: "PUT",
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
      if (res.ok) { toast.success("Cambios guardados"); await fetchBusito(); }
      else { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Error al guardar"); }
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const totals = useMemo(() => {
    if (!busito) return { ingresos: 0, gastos: 0, balance: 0 };
    const ingresos = busito.transactions.filter((t) => t.type === "INGRESO").reduce((s, t) => s + t.amount, 0);
    const gastos   = busito.transactions.filter((t) => t.type === "GASTO").reduce((s, t) => s + t.amount, 0);
    return { ingresos, gastos, balance: ingresos - gastos };
  }, [busito]);

  const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100";
  const labelCls = "block text-xs font-medium text-muted mb-1";

  if (!busito) {
    return (
      <DashboardShell title="Detalle de busito" currentPath="/busitos">
        <div className="py-12 text-center text-sm text-muted">Cargando...</div>
      </DashboardShell>
    );
  }

  const cfg = statusConfig[busito.status];

  return (
    <DashboardShell title={busito.name} currentPath="/busitos">
      <div className="space-y-5">
        <Link href="/busitos" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Volver a busitos
        </Link>

        {/* Summary */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-ink">{busito.name}</h1>
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cfg.classes}`}>{cfg.label}</span>
            </div>
            <span className="text-sm text-muted">{busito.transactions.length} movimiento{busito.transactions.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-success-100 bg-success-50 p-3.5">
              <p className="text-xs text-success-700">Ingresos</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-success-700">{fmt(totals.ingresos)}</p>
            </div>
            <div className="rounded-lg border border-danger-100 bg-danger-50 p-3.5">
              <p className="text-xs text-danger">Gastos</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-danger">{fmt(totals.gastos)}</p>
            </div>
            <div className={`rounded-lg p-3.5 ${totals.balance >= 0 ? "border border-brand-200 bg-brand-50" : "border border-danger-100 bg-danger-50"}`}>
              <p className={`text-xs ${totals.balance >= 0 ? "text-brand-700" : "text-danger"}`}>Balance</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${totals.balance >= 0 ? "text-brand-700" : "text-danger"}`}>{fmt(totals.balance)}</p>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="rounded-[10px] border border-border bg-surface">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">Transacciones</h2>
            <Link href="/transacciones" className="text-xs font-medium text-brand-700 hover:text-brand-900">
              Ir a transacciones
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted">Fecha</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted">Descripción</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted">Categoría</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted">Tipo</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted">Monto</th>
                </tr>
              </thead>
              <tbody>
                {busito.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-bg transition-colors">
                    <td className="px-4 py-2.5 text-muted whitespace-nowrap">{new Date(tx.date).toLocaleDateString("es-PA")}</td>
                    <td className="px-4 py-2.5 text-ink">{tx.description}</td>
                    <td className="px-4 py-2.5 text-muted">{tx.category ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${tx.type === "INGRESO" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                        {tx.type === "INGRESO" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 font-semibold tabular-nums ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                      {tx.type === "INGRESO" ? "+" : "−"}{fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
                {busito.transactions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">Sin transacciones registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Editar datos</h2>
          <form onSubmit={saveBusito}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Placa</label>
                <input value={form.plateNumber} onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))} placeholder="Opcional" className={inputCls} />
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
                <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Opcional" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Año</label>
                <input type="number" min={1980} max={2100} value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="Opcional" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Capacidad (pax)</label>
                <input type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="Opcional" className={inputCls} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={labelCls}>Descripción</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Opcional" className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-900 transition hover:opacity-90 disabled:opacity-60">
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
