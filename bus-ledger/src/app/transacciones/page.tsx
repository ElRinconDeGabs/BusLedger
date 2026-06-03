"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import * as toast from "@/lib/toast";

type Busito = { id: number; name: string };

type Transaction = {
  id: number;
  amount: number;
  description: string;
  type: string;
  createdAt: string;
  busito?: { id: number; name: string };
};

type EditForm = { description: string; amount: string; type: string };

export default function TransaccionesPage() {
  const settings = useDisplaySettings();
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({ description: "", amount: "", type: "ingreso", busitoId: "" });
  const [creating, setCreating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [busitoFilter, setBusitoFilter] = useState("all");

  // Edit modal
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ description: "", amount: "", type: "ingreso" });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { void bootstrap(); }, []);

  const bootstrap = async () => {
    const [busitosRes, txRes] = await Promise.all([fetch("/api/busitos"), fetch("/api/transactions")]);
    if (busitosRes.ok) {
      const data = (await busitosRes.json()) as Busito[];
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
        body: JSON.stringify({ description: form.description, amount: Number(form.amount), type: form.type, busitoId: Number(form.busitoId) }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al crear transacción");
        return;
      }
      toast.success("Transacción registrada");
      setForm((f) => ({ ...f, description: "", amount: "" }));
      await bootstrap();
    } finally {
      setCreating(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Transacción eliminada"); await bootstrap(); }
    else toast.error("Error al eliminar");
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditForm({ description: tx.description, amount: String(tx.amount), type: tx.type });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editForm.description, amount: Number(editForm.amount), type: editForm.type }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al guardar");
        return;
      }
      toast.success("Transacción actualizada");
      setEditingTx(null);
      await bootstrap();
    } finally {
      setEditSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = !search || tx.description.toLowerCase().includes(search.toLowerCase());
      const matchType =
        typeFilter === "all" ||
        (typeFilter === "ingreso" && (tx.type === "ingreso" || tx.type === "income")) ||
        (typeFilter === "gasto" && tx.type === "gasto");
      const matchBusito = busitoFilter === "all" || String(tx.busito?.id) === busitoFilter;
      return matchSearch && matchType && matchBusito;
    });
  }, [transactions, search, typeFilter, busitoFilter]);

  const isIngreso = (type: string) => type === "ingreso" || type === "income";

  return (
    <DashboardShell title="Transacciones" currentPath="/transacciones">
      <section className="grid gap-6 lg:grid-cols-[0.95fr,1.8fr]">
        {/* Create form */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Registrar movimiento</h2>
          <p className="mt-1 text-sm text-slate-500">Agrega ingresos o gastos ligados a un busito.</p>

          <form onSubmit={createTransaction} className="mt-4 space-y-3">
            <input
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
            <input
              type="number"
              placeholder="Monto"
              value={form.amount}
              min={0}
              step="0.01"
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
            <select
              value={form.busitoId}
              onChange={(e) => setForm((f) => ({ ...f, busitoId: e.target.value }))}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            >
              <option value="">Selecciona un busito</option>
              {busitos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Guardando..." : "Guardar transaccion"}
            </button>
          </form>
        </article>

        {/* List */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Historial de transacciones</h2>
              <p className="text-sm text-slate-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            <input
              placeholder="Buscar descripcion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
            </select>
            <select
              value={busitoFilter}
              onChange={(e) => setBusitoFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Todos los busitos</option>
              {busitos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((tx) => (
              <article key={tx.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{tx.description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString(settings.locale)} · {tx.busito?.name ?? "Sin busito"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${isIngreso(tx.type) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {isIngreso(tx.type) ? "Ingreso" : "Gasto"}
                  </span>
                </div>
                <p className={`mt-3 text-lg font-semibold ${isIngreso(tx.type) ? "text-emerald-600" : "text-rose-600"}`}>
                  {isIngreso(tx.type) ? "+" : "-"}{fmt(Number(tx.amount))}
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(tx)} className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Editar</button>
                  <button onClick={() => deleteTransaction(tx.id)} className="flex-1 rounded-lg border border-rose-200 bg-rose-50 py-1.5 text-xs text-rose-700 hover:bg-rose-100">Eliminar</button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No hay transacciones que coincidan.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Descripcion</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Monto</th>
                  <th className="px-3 py-2 font-medium">Busito</th>
                  <th className="px-3 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={tx.id} className={`${i % 2 ? "bg-slate-50/70" : "bg-white"} border-b border-slate-100 hover:bg-blue-50/30`}>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString(settings.locale)}</td>
                    <td className="px-3 py-2 text-slate-700 max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${isIngreso(tx.type) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {isIngreso(tx.type) ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className={`px-3 py-2 font-semibold ${isIngreso(tx.type) ? "text-emerald-600" : "text-rose-600"}`}>
                      {isIngreso(tx.type) ? "+" : "-"}{fmt(Number(tx.amount))}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{tx.busito?.name ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(tx)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100">Editar</button>
                        <button onClick={() => deleteTransaction(tx.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-100">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">No hay transacciones que coincidan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Edit modal */}
      {editingTx && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar transaccion</h3>
              <button onClick={() => setEditingTx(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={saveEdit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Descripcion</label>
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Monto</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Tipo</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTx(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" disabled={editSaving} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
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
