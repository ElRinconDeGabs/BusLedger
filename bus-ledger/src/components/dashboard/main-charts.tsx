"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from "recharts";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";

type Summary = {
  totals: { ingresos: number; egresos: number; balance: number };
  monthly: { month: string; ingresos: number; egresos: number; balance: number }[];
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

  const monthlyData = useMemo(() => {
    if (!data) return [];
    return data.monthly.map((m) => {
      const [y, mo] = m.month.split("-");
      const d = new Date(Number(y), Number(mo) - 1, 1);
      return {
        ...m,
        label: d.toLocaleDateString("es-PA", { month: "short", year: "2-digit" }),
      };
    });
  }, [data]);

  if (!data) {
    return (
      <div className="rounded-[10px] border border-border bg-surface p-5">
        <div className="h-72 flex items-center justify-center">
          <p className="text-sm text-muted">Cargando resumen financiero...</p>
        </div>
      </div>
    );
  }

  const balancePositive = data.totals.balance >= 0;

  return (
    <div className="rounded-[10px] border border-border bg-surface p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Resumen financiero</h2>
          <p className="text-sm text-muted">Ingresos y egresos por mes</p>
        </div>

        {/* Totals inline */}
        <div className="flex flex-wrap gap-4 sm:gap-6 text-right">
          <div>
            <p className="text-xs text-muted">Ingresos</p>
            <p className="text-base font-bold text-success-700">{fmt(data.totals.ingresos)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Egresos</p>
            <p className="text-base font-bold text-danger">{fmt(data.totals.egresos)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Balance</p>
            <p className={`text-base font-bold ${balancePositive ? "text-success-700" : "text-danger"}`}>
              {fmt(data.totals.balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 min-w-0">
        {mounted && monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={6} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.008 255)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "oklch(0.50 0.02 255)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={56}
                tick={{ fontSize: 11, fill: "oklch(0.50 0.02 255)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmt(v)}
              />
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid oklch(0.91 0.008 255)",
                  boxShadow: "0 4px 16px oklch(0.14 0.02 255 / 0.08)",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="ingresos" name="Ingresos" fill="oklch(0.60 0.18 150)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="egresos"  name="Egresos"  fill="oklch(0.55 0.22 25)"  radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-bg text-center">
            <p className="text-sm text-muted">
              {!mounted ? "Preparando gráfico..." : "Sin movimientos para mostrar."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
