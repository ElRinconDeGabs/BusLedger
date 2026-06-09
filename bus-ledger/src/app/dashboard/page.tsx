"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainCharts from "@/components/dashboard/main-charts";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import StatsCard from "@/components/dashboard/stats-card";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";

type Transaction = {
  id: number;
  amount: number;
  description: string;
  type: "INGRESO" | "GASTO";
  date: string;
  busito?: { id: number; name: string };
};

type MonthlySummary = { month: string; ingresos: number; egresos: number; balance: number };

export default function DashboardPage() {
  const settings = useDisplaySettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [busitoCount, setBusitoCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void bootstrap(); }, []);

  const bootstrap = async () => {
    try {
      const [busitosRes, txRes, summaryRes] = await Promise.all([
        fetch("/api/busitos"),
        fetch("/api/transactions?limit=8"),
        fetch("/api/dashboard/summary"),
      ]);
      if (busitosRes.ok) {
        const data = await busitosRes.json() as unknown[];
        setBusitoCount(data.length);
      }
      if (txRes.ok) setTransactions((await txRes.json()) as Transaction[]);
      if (summaryRes.ok) {
        const summary = (await summaryRes.json()) as { monthly: MonthlySummary[] };
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setCurrentMonth(summary.monthly.find((m) => m.month === key) ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => formatMoney(n, settings);
  const balance = currentMonth?.balance ?? 0;

  return (
    <DashboardShell title="Dashboard" currentPath="/dashboard">
      {/* Stats */}
      <section className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Busitos"
          value={String(busitoCount)}
          subtitle="Unidades registradas"
          icon="bus"
          variant="neutral"
        />
        <StatsCard
          title="Ingresos del mes"
          value={fmt(currentMonth?.ingresos ?? 0)}
          subtitle="Entradas del período"
          icon="income"
          variant="success"
        />
        <StatsCard
          title="Gastos del mes"
          value={fmt(currentMonth?.egresos ?? 0)}
          subtitle="Salidas del período"
          icon="expense"
          variant="danger"
        />
        <StatsCard
          title="Balance del mes"
          value={fmt(balance)}
          subtitle={balance >= 0 ? "Resultado positivo" : "Resultado negativo"}
          icon="balance"
          variant={balance >= 0 ? "brand" : "danger"}
        />
      </section>

      {/* Chart */}
      <section>
        <MainCharts />
      </section>

      {/* Bottom row */}
      <section className="grid gap-5 xl:grid-cols-[1.4fr,1fr]">
        {/* Recent transactions */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Transacciones recientes</h2>
              <p className="text-sm text-muted">Últimos 8 movimientos</p>
            </div>
            <Link href="/transacciones" className="text-sm font-medium text-brand-700 hover:text-brand-900">
              Ver todas
            </Link>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{tx.description}</p>
                  <p className="text-xs text-muted">
                    {tx.busito?.name ?? "—"} · {new Date(tx.date).toLocaleDateString("es-PA")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-semibold tabular-nums ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                    {tx.type === "INGRESO" ? "+" : "−"}{fmt(Number(tx.amount))}
                  </p>
                  <p className="text-[11px] text-muted">{tx.type === "INGRESO" ? "Ingreso" : "Gasto"}</p>
                </div>
              </div>
            ))}

            {!loading && transactions.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-bg px-4 py-8 text-center text-sm text-muted">
                Sin transacciones aún.{" "}
                <Link href="/transacciones" className="font-medium text-brand-700">
                  Registrar movimiento
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-ink mb-4">Accesos rápidos</h2>

          <div className="space-y-2">
            <Link
              href="/busitos"
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition hover:border-border-2 hover:bg-bg"
            >
              <div>
                <p className="text-sm font-medium text-ink">Busitos</p>
                <p className="text-xs text-muted">Gestionar unidades</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-faint" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>

            <Link
              href="/transacciones"
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition hover:border-border-2 hover:bg-bg"
            >
              <div>
                <p className="text-sm font-medium text-ink">Transacciones</p>
                <p className="text-xs text-muted">Registrar ingresos y gastos</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-faint" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>

            <Link
              href="/reportes"
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition hover:border-border-2 hover:bg-bg"
            >
              <div>
                <p className="text-sm font-medium text-ink">Reportes</p>
                <p className="text-xs text-muted">Análisis y gráficos</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-faint" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
