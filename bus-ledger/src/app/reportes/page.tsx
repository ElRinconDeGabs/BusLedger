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
  id: number; amount: number; description: string; type: string; createdAt: string;
  busito?: { id: number; name: string };
};
type BusitoStat = { id: number; name: string; ingresos: number; egresos: number; balance: number; count: number };

const PERIODS = [
  { label: "3 meses", months: 3 },
  { label: "6 meses", months: 6 },
  { label: "12 meses", months: 12 },
  { label: "Todo", months: 0 },
];

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
      return { ...m, label: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-DO", { month: "short", year: "2-digit" }) };
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
      if (tx.type === "ingreso" || tx.type === "income") s.ingresos += tx.amount; else s.egresos += tx.amount;
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

  return (
    <DashboardShell title="Reportes" currentPath="/reportes">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Periodo:</span>
        {PERIODS.map((p) => (
          <button key={p.months} onClick={() => setPeriod(p.months)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              period === p.months ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Ingresos del periodo</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{fmt(periodTotals.ingresos)}</p>
          {summary && period > 0 && <p className="mt-1 text-xs text-emerald-600">Total general: {fmt(summary.totals.ingresos)}</p>}
        </article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Egresos del periodo</p>
          <p className="mt-2 text-2xl font-bold text-rose-900">{fmt(periodTotals.egresos)}</p>
          {summary && period > 0 && <p className="mt-1 text-xs text-rose-600">Total general: {fmt(summary.totals.egresos)}</p>}
        </article>
        <article className={`rounded-2xl border p-5 shadow-sm ${periodBalance >= 0 ? "border-cyan-200 bg-cyan-50" : "border-orange-200 bg-orange-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${periodBalance >= 0 ? "text-cyan-700" : "text-orange-700"}`}>Balance del periodo</p>
          <p className={`mt-2 text-2xl font-bold ${periodBalance >= 0 ? "text-cyan-900" : "text-orange-900"}`}>{fmt(periodBalance)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Ingresos vs Egresos por mes</h2>
        <div className="h-72">
          {mounted && filteredMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMonthly} barGap={8}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e8edf2" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis width={55} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: "12px", border: "1px solid #dbe4ee" }} />
                <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle" />
                <Bar dataKey="ingresos" name="Ingresos" fill="#059669" radius={[8, 8, 0, 0]} />
                <Bar dataKey="egresos" name="Egresos" fill="#e11d48" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
              {!mounted ? "Cargando gráfico..." : "Sin datos para el periodo seleccionado."}
            </div>
          )}
        </div>
      </section>

      {mounted && balanceLine.length > 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Balance acumulado</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceLine}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e8edf2" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis width={55} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: "12px", border: "1px solid #dbe4ee" }} />
                <Line type="monotone" dataKey="balanceAcumulado" name="Balance acumulado" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {busitoStats.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Rendimiento por busito</h2>
            <p className="text-sm text-slate-500">Ordenado por ingresos totales.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Busito</th>
                  <th className="px-5 py-3">Ingresos</th>
                  <th className="px-5 py-3">Egresos</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Movimientos</th>
                </tr>
              </thead>
              <tbody>
                {busitoStats.map((b, i) => (
                  <tr key={b.id} className={`border-b border-slate-50 ${i % 2 ? "bg-slate-50/50" : ""}`}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{b.name}</td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-600">{fmt(b.ingresos)}</td>
                    <td className="px-5 py-3.5 font-semibold text-rose-600">{fmt(b.egresos)}</td>
                    <td className={`px-5 py-3.5 font-semibold ${b.balance >= 0 ? "text-cyan-700" : "text-orange-700"}`}>{fmt(b.balance)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
