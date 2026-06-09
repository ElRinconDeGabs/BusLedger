"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import * as toast from "@/lib/toast";

type Busito = { id: number; name: string };
type TxType = "INGRESO" | "GASTO";

type Transaction = {
  id: number;
  amount: number;
  description: string;
  type: TxType;
  category?: string;
  date: string;
  createdAt: string;
  busito?: { id: number; name: string };
};

const CATEGORIES: Record<TxType, { value: string; label: string }[]> = {
  INGRESO: [
    { value: "mensualidad", label: "Mensualidad" },
    { value: "viaje_especial", label: "Viaje especial" },
    { value: "charter", label: "Charter" },
    { value: "subsidio", label: "Subsidio" },
    { value: "otro", label: "Otro ingreso" },
  ],
  GASTO: [
    { value: "combustible", label: "Combustible" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "repuesto", label: "Repuesto" },
    { value: "seguro", label: "Seguro" },
    { value: "salario", label: "Salario conductor" },
    { value: "cuota", label: "Cuota / préstamo" },
    { value: "multa", label: "Multa" },
    { value: "peaje", label: "Peaje / SITTRANS" },
    { value: "lavado", label: "Lavado" },
    { value: "otro", label: "Otro gasto" },
  ],
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function TransaccionesPage() {
  const settings = useDisplaySettings();
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({
    description: "", amount: "", type: "INGRESO" as TxType,
    busitoId: "", category: "", date: todayISO(),
  });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [busitoFilter, setBusitoFilter] = useState("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ description: "", amount: "", type: "INGRESO" as TxType, category: "", date: "" });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { void bootstrap(); }, []);

  const bootstrap = async () => {
    const [bRes, txRes] = await Promise.all([fetch("/api/busitos"), fetch("/api/transactions")]);
    if (bRes.ok) {
      const data = (await bRes.json()) as Busito[];
      setBusitos(data);
      setForm((f) => ({ ...f, busitoId: f.busitoId || String(data[0]?.id ?? "") }));
    }
    if (txRes.ok) setTransactions((await txRes.json()) as Transaction[]);
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const createTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || !form.busitoId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description.trim(),
          amount: Number(form.amount),
          type: form.type,
          busitoId: Number(form.busitoId),
          category: form.category || null,
          date: form.date,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al registrar");
        return;
      }
      toast.success("Transacción registrada");
      setForm((f) => ({ ...f, description: "", amount: "", category: "", date: todayISO() }));
      await bootstrap();
    } finally {
      setCreating(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Eliminada"); await bootstrap(); }
    else toast.error("Error al eliminar");
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditForm({
      description: tx.description,
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category ?? "",
      date: tx.date.slice(0, 10),
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editForm.description,
          amount: Number(editForm.amount),
          type: editForm.type,
          category: editForm.category || null,
          date: editForm.date,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al guardar");
        return;
      }
      toast.success("Actualizada");
      setEditingTx(null);
      await bootstrap();
    } finally {
      setEditSaving(false);
    }
  };

  const filtered = useMemo(() => transactions.filter((tx) => {
    const matchSearch = !search || tx.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    const matchBusito = busitoFilter === "all" || String(tx.busito?.id) === busitoFilter;
    return matchSearch && matchType && matchBusito;
  }), [transactions, search, typeFilter, busitoFilter]);

  const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100";
  const labelCls = "block text-xs font-medium text-muted mb-1";

  return (
    <DashboardShell title="Transacciones" currentPath="/transacciones">
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        {/* Create form */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Registrar movimiento</h2>

          <form onSubmit={createTransaction} className="space-y-3">
            <div>
              <label className={labelCls}>Tipo</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["INGRESO", "GASTO"] as TxType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t, category: "" }))}
                    className={`flex-1 py-2 text-xs font-semibold transition ${
                      form.type === t
                        ? t === "INGRESO"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                        : "text-muted hover:bg-bg"
                    }`}
                  >
                    {t === "INGRESO" ? "Ingreso" : "Gasto"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Descripción *</label>
              <input
                placeholder="Ej: Combustible diesel"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Monto *</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                min={0.01}
                step="0.01"
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Categoría</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
                <option value="">Sin categoría</option>
                {CATEGORIES[form.type].map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Busito *</label>
              <select value={form.busitoId} onChange={(e) => setForm((f) => ({ ...f, busitoId: e.target.value }))} required className={inputCls}>
                <option value="">Selecciona un busito</option>
                {busitos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                max={todayISO()}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-900 transition hover:opacity-90 disabled:opacity-60"
            >
              {creating ? "Guardando..." : "Registrar"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-[10px] border border-border bg-surface p-5 min-w-0">
          <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Historial</h2>
              <p className="text-xs text-muted">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            <input
              placeholder="Buscar descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-100"
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-100">
              <option value="all">Todos los tipos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="GASTO">Gastos</option>
            </select>
            <select value={busitoFilter} onChange={(e) => setBusitoFilter(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-100">
              <option value="all">Todos los busitos</option>
              {busitos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filtered.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{tx.description}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(tx.date).toLocaleDateString("es-PA")} · {tx.busito?.name ?? "—"}
                      {tx.category && ` · ${tx.category}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${tx.type === "INGRESO" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                    {tx.type === "INGRESO" ? "Ingreso" : "Gasto"}
                  </span>
                </div>
                <p className={`text-base font-bold tabular-nums ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                  {tx.type === "INGRESO" ? "+" : "−"}{fmt(Number(tx.amount))}
                </p>
                <div className="mt-2.5 flex gap-2">
                  <button onClick={() => openEdit(tx)} className="flex-1 rounded border border-border py-1.5 text-xs text-muted hover:text-ink">Editar</button>
                  <button onClick={() => deleteTransaction(tx.id)} className="flex-1 rounded border border-danger-100 bg-danger-50 py-1.5 text-xs text-danger">Eliminar</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">Sin transacciones que coincidan.</div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Fecha</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Descripción</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Categoría</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Tipo</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Monto</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Busito</th>
                  <th className="px-3 py-2 text-xs font-semibold text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-bg transition-colors">
                    <td className="px-3 py-2.5 text-muted whitespace-nowrap">{new Date(tx.date).toLocaleDateString("es-PA")}</td>
                    <td className="px-3 py-2.5 text-ink max-w-[180px] truncate">{tx.description}</td>
                    <td className="px-3 py-2.5 text-muted whitespace-nowrap">{tx.category ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${tx.type === "INGRESO" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                        {tx.type === "INGRESO" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 font-semibold tabular-nums whitespace-nowrap ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                      {tx.type === "INGRESO" ? "+" : "−"}{fmt(Number(tx.amount))}
                    </td>
                    <td className="px-3 py-2.5 text-muted whitespace-nowrap">{tx.busito?.name ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(tx)} className="rounded border border-border px-2.5 py-1 text-xs text-muted hover:text-ink hover:border-border-2">Editar</button>
                        <button onClick={() => deleteTransaction(tx.id)} className="rounded border border-danger-100 bg-danger-50 px-2.5 py-1 text-xs text-danger hover:bg-danger-100">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-muted">Sin transacciones que coincidan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editingTx && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[10px] bg-surface p-6 shadow-2xl shadow-ink/10">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Editar transacción</h3>
              <button onClick={() => setEditingTx(null)} className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-ink">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-3">
              <div>
                <label className={labelCls}>Tipo</label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["INGRESO", "GASTO"] as TxType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, type: t, category: "" }))}
                      className={`flex-1 py-2 text-xs font-semibold transition ${
                        editForm.type === t
                          ? t === "INGRESO" ? "bg-success text-white" : "bg-danger text-white"
                          : "text-muted hover:bg-bg"
                      }`}
                    >
                      {t === "INGRESO" ? "Ingreso" : "Gasto"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Monto</label>
                <input type="number" min={0.01} step="0.01" value={editForm.amount} onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Categoría</label>
                <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
                  <option value="">Sin categoría</option>
                  {CATEGORIES[editForm.type].map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Fecha</label>
                <input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} max={todayISO()} className={inputCls} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditingTx(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted hover:text-ink">
                  Cancelar
                </button>
                <button type="submit" disabled={editSaving} className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-900 hover:opacity-90 disabled:opacity-60">
                  {editSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
