"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";

type Summary = {
  totals: { ingresos: number; egresos: number; balance: number };
  monthly: { month: string; ingresos: number; egresos: number; balance: number }[];
};

export default function MainCharts() {
  const [data, setData] = useState<Summary | null>(null);
  const settings = useDisplaySettings();

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() =>
        setData({
          totals: { ingresos: 0, egresos: 0, balance: 0 },
          monthly: [],
        })
      );
  }, []);

  const fmt = (n: number) => formatMoney(n, settings);

  const monthlyData = useMemo(() => {
    if (!data) return [];
    return data.monthly.map((m) => {
      const [y, mo] = m.month.split("-");
      const d = new Date(Number(y), Number(mo) - 1, 1);
      return {
        ...m,
        label: d.toLocaleDateString("es-DO", { month: "short", year: "2-digit" }),
      };
    });
  }, [data]);

  const hasMonthlyData = monthlyData.length > 0;

  if (!data) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
        <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-cyan-100/50 blur-2xl" />
        <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-emerald-100/40 blur-3xl" />
        <p className="relative text-sm font-medium text-slate-600">Cargando resumen y graficos...</p>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-cyan-50/40 p-4 shadow-sm sm:p-6">
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Vista general
          </p>
          <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">Resumen financiero</h2>
          <p className="text-sm text-slate-500">Ingresos y egresos consolidados por mes</p>
        </div>
      </div>

      <div className="relative mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Ingresos</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{fmt(data.totals.ingresos)}</p>
        </article>

        <article className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Egresos</p>
          <p className="mt-2 text-2xl font-bold text-rose-900">{fmt(data.totals.egresos)}</p>
        </article>

        <article className="rounded-2xl border border-cyan-200/80 bg-cyan-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Balance</p>
          <p className="mt-2 text-2xl font-bold text-cyan-900">{fmt(data.totals.balance)}</p>
        </article>
      </div>

      <div className="relative h-80 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-inner">
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={12}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dfe6ee" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => fmt(Number(value))}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #dbe4ee",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle" />
              <Bar dataKey="ingresos" name="Ingresos" fill="#059669" radius={[10, 10, 0, 0]} />
              <Bar dataKey="egresos" name="Egresos" fill="#e11d48" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <p className="max-w-xs text-sm text-slate-500">
              Aun no hay movimientos mensuales para mostrar en el grafico.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}