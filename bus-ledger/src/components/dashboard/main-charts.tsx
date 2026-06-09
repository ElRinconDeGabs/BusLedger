"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";

type Summary = {
  totals: { ingresos: number; egresos: number; balance: number };
  monthly: { month: string; ingresos: number; egresos: number }[];
};

export default function MainCharts() {
  const [data, setData] = useState<Summary | null>(null);
  const [mounted, setMounted] = useState(false);
  const settings = useDisplaySettings();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ totals: { ingresos: 0, egresos: 0, balance: 0 }, monthly: [] }));
  }, []);

  const fmt = (n: number) => formatMoney(n, settings);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.monthly.map((m) => {
      const [y, mo] = m.month.split("-");
      return {
        ...m,
        label: new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-PA", { month: "short", year: "2-digit" }),
      };
    });
  }, [data]);

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex h-48 items-center justify-center text-sm text-muted">
          Cargando resumen financiero...
        </div>
      </div>
    );
  }

  const balancePos = data.totals.balance >= 0;

  return (
    <div className="rounded-lg border border-border bg-surface">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Resumen financiero</h2>
          <p className="text-xs text-muted mt-0.5">Ingresos y egresos por mes</p>
        </div>
        <div className="flex gap-5 sm:gap-6">
          <div>
            <p className="text-xs text-muted">Ingresos</p>
            <p className="text-base font-bold tabular-nums text-success-700">{fmt(data.totals.ingresos)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Egresos</p>
            <p className="text-base font-bold tabular-nums text-danger">{fmt(data.totals.egresos)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Balance</p>
            <p className={`text-base font-bold tabular-nums ${balancePos ? "text-success-700" : "text-danger"}`}>
              {fmt(data.totals.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="h-64">
          {mounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.004 255)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.50 0.012 255)" }} axisLine={false} tickLine={false} />
                <YAxis width={64} tick={{ fontSize: 11, fill: "oklch(0.50 0.012 255)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                <Tooltip
                  formatter={(v) => fmt(Number(v))}
                  contentStyle={{ borderRadius: "8px", border: "1px solid oklch(0.91 0.004 255)", fontSize: "12px", boxShadow: "0 4px 12px oklch(0.14 0.015 255 / 0.08)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" iconSize={8} />
                <Bar dataKey="ingresos" name="Ingresos" fill="oklch(0.58 0.18 150)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="egresos"  name="Egresos"  fill="oklch(0.55 0.20 25)"  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-bg text-sm text-muted">
              {!mounted ? "Preparando gráfico..." : "Sin movimientos registrados todavía."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
