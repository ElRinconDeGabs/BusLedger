"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import { ui } from "@/lib/ui";
import * as toast from "@/lib/toast";

type TxType = "INGRESO" | "GASTO";
type Busito = { id: number; name: string };
type Transaction = { id: number; amount: number; description: string; type: TxType; category?: string; date: string; busito?: { id: number; name: string } };

const CATS: Record<TxType, { value: string; label: string }[]> = {
  INGRESO: [{ value: "mensualidad", label: "Mensualidad" }, { value: "viaje_especial", label: "Viaje especial" }, { value: "charter", label: "Charter" }, { value: "subsidio", label: "Subsidio" }, { value: "otro", label: "Otro" }],
  GASTO:   [{ value: "combustible", label: "Combustible" }, { value: "mantenimiento", label: "Mantenimiento" }, { value: "repuesto", label: "Repuesto" }, { value: "seguro", label: "Seguro" }, { value: "salario", label: "Salario" }, { value: "cuota", label: "Cuota" }, { value: "multa", label: "Multa" }, { value: "peaje", label: "Peaje" }, { value: "otro", label: "Otro" }],
};
const today = () => new Date().toISOString().slice(0, 10);

export default function TransaccionesPage() {
  const settings = useDisplaySettings();
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [txs, setTxs]         = useState<Transaction[]>([]);
  const [form, setForm]       = useState({ description: "", amount: "", type: "INGRESO" as TxType, busitoId: "", category: "", date: today() });
  const [creating, setCreating] = useState(false);
  const [search, setSearch]   = useState("");
  const [typeFilter, setType] = useState("all");
  const [busFilter, setBus]   = useState("all");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editForm, setEdit]   = useState({ description: "", amount: "", type: "INGRESO" as TxType, category: "", date: "" });
  const [saving, setSaving]   = useState(false);

  useEffect(() => { void load(); }, []);

  const load = async () => {
    const [bRes, tRes] = await Promise.all([fetch("/api/busitos"), fetch("/api/transactions")]);
    if (bRes.ok) { const d = (await bRes.json()) as Busito[]; setBusitos(d); setForm((f) => ({ ...f, busitoId: f.busitoId || String(d[0]?.id ?? "") })); }
    if (tRes.ok) setTxs((await tRes.json()) as Transaction[]);
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || !form.busitoId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: Number(form.amount), busitoId: Number(form.busitoId), category: form.category || null }) });
      if (!res.ok) { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Error"); return; }
      toast.success("Transacción registrada");
      setForm((f) => ({ ...f, description: "", amount: "", category: "", date: today() }));
      await load();
    } finally { setCreating(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Eliminada"); await load(); } else toast.error("Error");
  };

  const openEdit = (tx: Transaction) => { setEditing(tx); setEdit({ description: tx.description, amount: String(tx.amount), type: tx.type, category: tx.category ?? "", date: tx.date.slice(0, 10) }); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editForm, amount: Number(editForm.amount), category: editForm.category || null }) });
      if (!res.ok) { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Error"); return; }
      toast.success("Actualizada"); setEditing(null); await load();
    } finally { setSaving(false); }
  };

  const filtered = useMemo(() => txs.filter((tx) => {
    const s = !search || tx.description.toLowerCase().includes(search.toLowerCase());
    const t = typeFilter === "all" || tx.type === typeFilter;
    const b = busFilter === "all" || String(tx.busito?.id) === busFilter;
    return s && t && b;
  }), [txs, search, typeFilter, busFilter]);

  const TypeToggle = ({ value, onChange }: { value: TxType; onChange: (v: TxType) => void }) => (
    <div className="flex overflow-hidden rounded-lg border border-border">
      {(["INGRESO", "GASTO"] as TxType[]).map((t) => (
        <button key={t} type="button" onClick={() => onChange(t)}
          className={`flex-1 py-2 text-xs font-semibold transition ${value === t ? (t === "INGRESO" ? "bg-success text-white" : "bg-danger text-white") : "text-muted hover:bg-surface-2"}`}>
          {t === "INGRESO" ? "Ingreso" : "Gasto"}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardShell title="Transacciones" currentPath="/transacciones">
      <div className="grid gap-5 lg:grid-cols-[300px,1fr]">
        {/* Form */}
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Registrar movimiento</h2>
          </div>
          <form onSubmit={create} className="space-y-3 p-5">
            <div>
              <label className={ui.label}>Tipo</label>
              <TypeToggle value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v, category: "" }))} />
            </div>
            <div>
              <label className={ui.label}>Descripción *</label>
              <input placeholder="Ej: Combustible" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Monto *</label>
              <input type="number" placeholder="0.00" min={0.01} step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Categoría</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={ui.select}>
                <option value="">Sin categoría</option>
                {CATS[form.type].map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={ui.label}>Busito *</label>
              <select value={form.busitoId} onChange={(e) => setForm((f) => ({ ...f, busitoId: e.target.value }))} required className={ui.select}>
                <option value="">Selecciona un busito</option>
                {busitos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={ui.label}>Fecha</label>
              <input type="date" value={form.date} max={today()} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={ui.input} />
            </div>
            <button type="submit" disabled={creating} className={`${ui.btn.primary} w-full`}>
              {creating ? "Guardando..." : "Registrar"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Historial</h2>
            <p className="text-xs text-muted">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Filters */}
          <div className="grid gap-2 border-b border-border p-4 sm:grid-cols-3">
            <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className={ui.input} />
            <select value={typeFilter} onChange={(e) => setType(e.target.value)} className={ui.select}>
              <option value="all">Todos los tipos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="GASTO">Gastos</option>
            </select>
            <select value={busFilter} onChange={(e) => setBus(e.target.value)} className={ui.select}>
              <option value="all">Todos los busitos</option>
              {busitos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border md:hidden">
            {filtered.map((tx) => (
              <div key={tx.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-medium text-ink leading-snug">{tx.description}</p>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${tx.type === "INGRESO" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                    {tx.type === "INGRESO" ? "Ingreso" : "Gasto"}
                  </span>
                </div>
                <p className="text-xs text-muted mb-2">{new Date(tx.date).toLocaleDateString("es-PA")} · {tx.busito?.name ?? "—"}{tx.category ? ` · ${tx.category}` : ""}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-base font-bold tabular-nums ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                    {tx.type === "INGRESO" ? "+" : "−"}{fmt(tx.amount)}
                  </p>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(tx)} className={ui.btn.secondary + " py-1 px-2.5 text-xs"}>Editar</button>
                    <button onClick={() => remove(tx.id)} className={ui.btn.danger + " py-1 px-2.5 text-xs"}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted">Sin resultados.</div>}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Fecha", "Descripción", "Categoría", "Tipo", "Monto", "Busito", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{new Date(tx.date).toLocaleDateString("es-PA")}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate font-medium text-ink">{tx.description}</td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{tx.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${tx.type === "INGRESO" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"}`}>
                        {tx.type === "INGRESO" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold tabular-nums whitespace-nowrap ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                      {tx.type === "INGRESO" ? "+" : "−"}{fmt(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{tx.busito?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(tx)} className={ui.btn.secondary + " py-1 px-2.5 text-xs"}>Editar</button>
                        <button onClick={() => remove(tx.id)} className={ui.btn.danger + " py-1 px-2.5 text-xs"}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-xl shadow-ink/10">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-ink">Editar transacción</h3>
              <button onClick={() => setEditing(null)} className={ui.btn.ghost + " h-8 w-8 p-0"}>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4L4 12M4 4l8 8" /></svg>
              </button>
            </div>
            <form onSubmit={save} className="space-y-3 p-5">
              <div>
                <label className={ui.label}>Tipo</label>
                <div className="flex overflow-hidden rounded-lg border border-border">
                  {(["INGRESO", "GASTO"] as TxType[]).map((t) => (
                    <button key={t} type="button" onClick={() => setEdit((f) => ({ ...f, type: t, category: "" }))}
                      className={`flex-1 py-2 text-xs font-semibold transition ${editForm.type === t ? (t === "INGRESO" ? "bg-success text-white" : "bg-danger text-white") : "text-muted hover:bg-surface-2"}`}>
                      {t === "INGRESO" ? "Ingreso" : "Gasto"}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={ui.label}>Descripción</label><input value={editForm.description} onChange={(e) => setEdit((f) => ({ ...f, description: e.target.value }))} required className={ui.input} /></div>
              <div><label className={ui.label}>Monto</label><input type="number" min={0.01} step="0.01" value={editForm.amount} onChange={(e) => setEdit((f) => ({ ...f, amount: e.target.value }))} required className={ui.input} /></div>
              <div>
                <label className={ui.label}>Categoría</label>
                <select value={editForm.category} onChange={(e) => setEdit((f) => ({ ...f, category: e.target.value }))} className={ui.select}>
                  <option value="">Sin categoría</option>
                  {CATS[editForm.type].map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><label className={ui.label}>Fecha</label><input type="date" value={editForm.date} max={today()} onChange={(e) => setEdit((f) => ({ ...f, date: e.target.value }))} className={ui.input} /></div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditing(null)} className={`${ui.btn.secondary} flex-1`}>Cancelar</button>
                <button type="submit" disabled={saving} className={`${ui.btn.primary} flex-1`}>{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
