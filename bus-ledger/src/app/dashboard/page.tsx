"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainCharts from "@/components/dashboard/main-charts";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import StatsCard from "@/components/dashboard/stats-card";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import { ui } from "@/lib/ui";

type Transaction = {
  id: number; amount: number; description: string;
  type: "INGRESO" | "GASTO"; date: string;
  busito?: { id: number; name: string };
};
type MonthlySummary = { month: string; ingresos: number; egresos: number; balance: number };

export default function DashboardPage() {
  const settings = useDisplaySettings();
  const [txs, setTxs]             = useState<Transaction[]>([]);
  const [busitoCount, setBusCnt]   = useState(0);
  const [currentMonth, setCurrent] = useState<MonthlySummary | null>(null);
  const [loading, setLoading]      = useState(true);

  useEffect(() => { void load(); }, []);

  const load = async () => {
    try {
      const [busRes, txRes, sumRes] = await Promise.all([
        fetch("/api/busitos"),
        fetch("/api/transactions?limit=8"),
        fetch("/api/dashboard/summary"),
      ]);
      if (busRes.ok) setBusCnt(((await busRes.json()) as unknown[]).length);
      if (txRes.ok) setTxs((await txRes.json()) as Transaction[]);
      if (sumRes.ok) {
        const { monthly } = (await sumRes.json()) as { monthly: MonthlySummary[] };
        const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
        setCurrent(monthly.find((m) => m.month === key) ?? null);
      }
    } finally { setLoading(false); }
  };

  const fmt = (n: number) => formatMoney(n, settings);
  const balance = currentMonth?.balance ?? 0;

  return (
    <DashboardShell title="Dashboard" currentPath="/dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatsCard title="Busitos" value={String(busitoCount)} subtitle="Unidades" icon="bus" />
        <StatsCard title="Ingresos del mes" value={fmt(currentMonth?.ingresos ?? 0)} icon="income" variant="success" />
        <StatsCard title="Gastos del mes"   value={fmt(currentMonth?.egresos ?? 0)} icon="expense" variant="danger" />
        <StatsCard
          title="Balance del mes"
          value={fmt(balance)}
          subtitle={balance >= 0 ? "Positivo" : "Negativo"}
          icon="balance"
          variant={balance >= 0 ? "brand" : "danger"}
        />
      </div>

      {/* Chart */}
      <MainCharts />

      {/* Bottom */}
      <div className="grid gap-5 xl:grid-cols-[1fr,320px]">
        {/* Recent transactions */}
        <div className={ui.card}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Transacciones recientes</h2>
              <p className="text-xs text-muted">Últimos 8 movimientos</p>
            </div>
            <Link href="/transacciones" className="text-xs font-medium text-brand hover:text-brand-600">
              Ver todas →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {txs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{tx.description}</p>
                  <p className="text-xs text-muted">
                    {tx.busito?.name ?? "—"} · {new Date(tx.date).toLocaleDateString("es-PA")}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-semibold tabular-nums ${tx.type === "INGRESO" ? "text-success-700" : "text-danger"}`}>
                  {tx.type === "INGRESO" ? "+" : "−"}{fmt(tx.amount)}
                </p>
              </div>
            ))}
            {!loading && txs.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-muted">
                Sin movimientos.{" "}
                <Link href="/transacciones" className="font-medium text-brand">Registrar</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Accesos rápidos</h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { href: "/busitos",       label: "Busitos",       desc: "Gestionar unidades" },
              { href: "/transacciones", label: "Transacciones", desc: "Registrar movimientos" },
              { href: "/reportes",      label: "Reportes",      desc: "Ver análisis" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-5 py-3.5 text-sm transition hover:bg-surface-2"
              >
                <div>
                  <p className="font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-faint" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
