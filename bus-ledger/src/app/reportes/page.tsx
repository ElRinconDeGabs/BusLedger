"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, LineChart, Line,
} from "recharts";

type MonthlySummary = { month: string; ingresos: number; egresos: number; balance: number };
type Summary = { totals: { ingresos: number; egresos: number; balance: number }; monthly: MonthlySummary[] };
type Transaction = {
  id: number; amount: number; type: "INGRESO" | "GASTO";
  busito?: { id: number; name: string };
};
type BusitoStat = { id: number; name: string; ingresos: number; egresos: number; balance: number; count: number };

const PERIODS = [
  { label: "3 meses", months: 3 },
  { label: "6 meses", months: 6 },
  { label: "12 meses", months: 12 },
  { label: "Todo", months: 0 },
];

const CHART_COLORS = {
  ingreso: "oklch(0.60 0.18 150)",
  gasto:   "oklch(0.55 0.22 25)",
  balance: "oklch(0.73 0.18 58)",
};

export default function ReportesPage() {
  const settings = useDisplaySettings();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    void Promise.all([
      fetch("/api/dashboard/summary").then((r) => r.json()).then(setSummary).catch(() => null),
      fetch("/api/transactions").then((r) => r.json()).then(setTransactions).catch(() => null),
    ]);
  }, []);

  const fmt = (n: number) => formatMoney(n, settings);

  const filteredMonthly = useMemo(() => {
    if (!summary) return [];
    const data = summary.monthly.map((m) => {
      const [y, mo] = m.month.split("-");
      return { ...m, label: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-PA", { month: "short", year: "2-digit" }) };
    });
    return period === 0 ? data : data.slice(-period);
  }, [summary, period]);

  const periodTotals = useMemo(() =>
    filteredMonthly.reduce((acc, m) => ({ ingresos: acc.ingresos + m.ingresos, egresos: acc.egresos + m.egresos }), { ingresos: 0, egresos: 0 }),
    [filteredMonthly]
  );

  const busitoStats = useMemo((): BusitoStat[] => {
    const map = new Map<number, BusitoStat>();
    for (const tx of transactions) {
      if (!tx.busito) continue;
      const { id, name } = tx.busito;
      if (!map.has(id)) map.set(id, { id, name, ingresos: 0, egresos: 0, balance: 0, count: 0 });
      const s = map.get(id)!;
      if (tx.type === "INGRESO") s.ingresos += tx.amount; else s.egresos += tx.amount;
      s.balance = s.ingresos - s.egresos;
      s.count++;
    }
    return Array.from(map.values()).sort((a, b) => b.ingresos - a.ingresos);
  }, [transactions]);

  const balanceLine = useMemo(() => {
    let running = 0;
    return filteredMonthly.map((m) => { running += m.ingresos - m.egresos; return { ...m, balanceAcumulado: running }; });
  }, [filteredMonthly]);

  const periodBalance = periodTotals.ingresos - periodTotals.egresos;

  const chartTooltipStyle = {
    borderRadius: "8px",
    border: "1px solid oklch(0.91 0.008 255)",
    boxShadow: "0 4px 16px oklch(0.14 0.02 255 / 0.08)",
    fontSize: "12px",
  };

  return (
    <DashboardShell title="Reportes" currentPath="/reportes">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Período:</span>
        {PERIODS.map((p) => (
          <button
            key={p.months}
            onClick={() => setPeriod(p.months)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              period === p.months
                ? "bg-brand text-brand-900"
                : "border border-border text-muted hover:text-ink hover:border-border-2"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-success-100 bg-success-50 p-4">
          <p className="text-xs text-success-700">Ingresos del período</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-success-700">{fmt(periodTotals.ingresos)}</p>
          {summary && period > 0 && (
            <p className="mt-1 text-xs text-success-700 opacity-70">Total general: {fmt(summary.totals.ingresos)}</p>
          )}
        </div>
        <div className="rounded-[10px] border border-danger-100 bg-danger-50 p-4">
          <p className="text-xs text-danger">Egresos del período</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-danger">{fmt(periodTotals.egresos)}</p>
          {summary && period > 0 && (
            <p className="mt-1 text-xs text-danger opacity-70">Total general: {fmt(summary.totals.egresos)}</p>
          )}
        </div>
        <div className={`rounded-[10px] p-4 ${periodBalance >= 0 ? "border border-brand-200 bg-brand-50" : "border border-danger-100 bg-danger-50"}`}>
          <p className={`text-xs ${periodBalance >= 0 ? "text-brand-700" : "text-danger"}`}>Balance del período</p>
          <p className={`mt-1.5 text-2xl font-bold tabular-nums ${periodBalance >= 0 ? "text-brand-700" : "text-danger"}`}>{fmt(periodBalance)}</p>
        </div>
      </section>

      {/* Bar chart */}
      <div className="rounded-[10px] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink mb-4">Ingresos vs Egresos por mes</h2>
        <div className="h-72">
          {mounted && filteredMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMonthly} barGap={6} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.008 255)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.50 0.02 255)" }} axisLine={false} tickLine={false} />
                <YAxis width={56} tick={{ fontSize: 11, fill: "oklch(0.50 0.02 255)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} iconType="circle" iconSize={8} />
                <Bar dataKey="ingresos" name="Ingresos" fill={CHART_COLORS.ingreso} radius={[5, 5, 0, 0]} />
                <Bar dataKey="egresos"  name="Egresos"  fill={CHART_COLORS.gasto}   radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-bg text-sm text-muted">
              {!mounted ? "Preparando gráfico..." : "Sin datos para el período."}
            </div>
          )}
        </div>
      </div>

      {/* Balance line chart */}
      {mounted && balanceLine.length > 1 && (
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Balance acumulado</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceLine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.008 255)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.50 0.02 255)" }} axisLine={false} tickLine={false} />
                <YAxis width={56} tick={{ fontSize: 11, fill: "oklch(0.50 0.02 255)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="balanceAcumulado" name="Balance acumulado" stroke={CHART_COLORS.balance} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Busito performance table */}
      {busitoStats.length > 0 && (
        <div className="rounded-[10px] border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold text-ink">Rendimiento por busito</h2>
            <p className="text-xs text-muted mt-0.5">Ordenado por ingresos totales.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-muted">Busito</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted">Ingresos</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted">Egresos</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted">Balance</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted">Movimientos</th>
                </tr>
              </thead>
              <tbody>
                {busitoStats.map((b) => (
                  <tr key={b.id} className="border-b border-border hover:bg-bg transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">{b.name}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums text-success-700">{fmt(b.ingresos)}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums text-danger">{fmt(b.egresos)}</td>
                    <td className={`px-5 py-3 font-semibold tabular-nums ${b.balance >= 0 ? "text-brand-700" : "text-danger"}`}>{fmt(b.balance)}</td>
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
