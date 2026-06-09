"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import { ui } from "@/lib/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from "recharts";

type Summary = { totals: { ingresos: number; egresos: number; balance: number }; monthly: { month: string; ingresos: number; egresos: number }[] };
type Transaction = { id: number; amount: number; type: "INGRESO" | "GASTO"; busito?: { id: number; name: string } };
type BusitoStat = { id: number; name: string; ingresos: number; egresos: number; balance: number; count: number };

const PERIODS = [{ label: "3 meses", v: 3 }, { label: "6 meses", v: 6 }, { label: "12 meses", v: 12 }, { label: "Todo", v: 0 }];
const tooltipStyle = { borderRadius: "8px", border: "1px solid oklch(0.91 0.004 255)", fontSize: "12px", boxShadow: "0 4px 12px oklch(0.14 0.015 255 / 0.08)" };

export default function ReportesPage() {
  const settings = useDisplaySettings();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [txs, setTxs]         = useState<Transaction[]>([]);
  const [period, setPeriod]   = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    void Promise.all([
      fetch("/api/dashboard/summary").then((r) => r.json()).then(setSummary).catch(() => null),
      fetch("/api/transactions").then((r) => r.json()).then(setTxs).catch(() => null),
    ]);
  }, []);

  const fmt = (n: number) => formatMoney(n, settings);

  const monthly = useMemo(() => {
    if (!summary) return [];
    const all = summary.monthly.map((m) => {
      const [y, mo] = m.month.split("-");
      return { ...m, label: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-PA", { month: "short", year: "2-digit" }) };
    });
    return period === 0 ? all : all.slice(-period);
  }, [summary, period]);

  const totals = useMemo(() => monthly.reduce((a, m) => ({ i: a.i + m.ingresos, g: a.g + m.egresos }), { i: 0, g: 0 }), [monthly]);
  const balance = totals.i - totals.g;

  const busitoStats = useMemo((): BusitoStat[] => {
    const map = new Map<number, BusitoStat>();
    for (const tx of txs) {
      if (!tx.busito) continue;
      const { id, name } = tx.busito;
      if (!map.has(id)) map.set(id, { id, name, ingresos: 0, egresos: 0, balance: 0, count: 0 });
      const s = map.get(id)!;
      if (tx.type === "INGRESO") s.ingresos += tx.amount; else s.egresos += tx.amount;
      s.balance = s.ingresos - s.egresos;
      s.count++;
    }
    return Array.from(map.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [txs]);

  const balanceLine = useMemo(() => {
    let running = 0;
    return monthly.map((m) => { running += m.ingresos - m.egresos; return { ...m, acumulado: running }; });
  }, [monthly]);

  return (
    <DashboardShell title="Reportes" currentPath="/reportes">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted">Período:</span>
        {PERIODS.map((p) => (
          <button key={p.v} onClick={() => setPeriod(p.v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${period === p.v ? "bg-brand text-white" : "border border-border text-muted hover:border-border-2 hover:text-ink"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-success-100 bg-success-50 p-4">
          <p className="text-xs text-success-700">Ingresos del período</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-success-700">{fmt(totals.i)}</p>
          {summary && period > 0 && <p className="mt-1 text-xs text-success-700 opacity-60">Total: {fmt(summary.totals.ingresos)}</p>}
        </div>
        <div className="rounded-lg border border-danger-100 bg-danger-50 p-4">
          <p className="text-xs text-danger">Egresos del período</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-danger">{fmt(totals.g)}</p>
          {summary && period > 0 && <p className="mt-1 text-xs text-danger opacity-60">Total: {fmt(summary.totals.egresos)}</p>}
        </div>
        <div className={`rounded-lg p-4 ${balance >= 0 ? "border border-brand-200 bg-brand-50" : "border border-danger-100 bg-danger-50"}`}>
          <p className={`text-xs ${balance >= 0 ? "text-brand-700" : "text-danger"}`}>Balance del período</p>
          <p className={`mt-1.5 text-2xl font-bold tabular-nums ${balance >= 0 ? "text-brand-600" : "text-danger"}`}>{fmt(balance)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className={ui.card}>
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Ingresos vs Egresos por mes</h2>
        </div>
        <div className="p-5">
          <div className="h-64">
            {mounted && monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.004 255)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.50 0.012 255)" }} axisLine={false} tickLine={false} />
                  <YAxis width={64} tick={{ fontSize: 11, fill: "oklch(0.50 0.012 255)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                  <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" iconSize={8} />
                  <Bar dataKey="ingresos" name="Ingresos" fill="oklch(0.58 0.18 150)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="egresos"  name="Egresos"  fill="oklch(0.55 0.20 25)"  radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-bg text-sm text-muted">
                {!mounted ? "Cargando..." : "Sin datos para el período."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line chart */}
      {mounted && balanceLine.length > 1 && (
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Balance acumulado</h2>
          </div>
          <div className="p-5">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceLine}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.004 255)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.50 0.012 255)" }} axisLine={false} tickLine={false} />
                  <YAxis width={64} tick={{ fontSize: 11, fill: "oklch(0.50 0.012 255)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                  <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="acumulado" name="Balance acumulado" stroke="oklch(0.50 0.24 264)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Busito table */}
      {busitoStats.length > 0 && (
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Rendimiento por busito</h2>
            <p className="text-xs text-muted">Ordenado por ingresos totales</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Busito", "Ingresos", "Egresos", "Balance", "Movimientos"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {busitoStats.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">{b.name}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums text-success-700">{fmt(b.ingresos)}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums text-danger">{fmt(b.egresos)}</td>
                    <td className={`px-5 py-3 font-semibold tabular-nums ${b.balance >= 0 ? "text-brand-600" : "text-danger"}`}>{fmt(b.balance)}</td>
                    <td className="px-5 py-3 text-muted">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
