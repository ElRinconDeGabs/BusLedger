"use client";

import { useEffect, useMemo, useState } from "react";
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
  type: string;
  createdAt: string;
  busito?: {
    id: number;
    name: string;
  };
};

type Busito = {
  id: number;
};

export default function DashboardPage() {
  const settings = useDisplaySettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      const [busitosRes, transactionsRes] = await Promise.all([
        fetch("/api/busitos"),
        fetch("/api/transactions?limit=8"),
      ]);

      if (busitosRes.ok) setBusitos((await busitosRes.json()) as Busito[]);
      if (transactionsRes.ok) setTransactions((await transactionsRes.json()) as Transaction[]);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const metrics = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthTransactions = transactions.filter((tx) => {
      const date = new Date(tx.createdAt);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const ingresosMes = monthTransactions
      .filter((tx) => tx.type.toLowerCase() === "ingreso" || tx.type.toLowerCase() === "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const gastosMes = monthTransactions
      .filter((tx) => tx.type.toLowerCase() !== "ingreso" && tx.type.toLowerCase() !== "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      totalBusitos: busitos.length,
      totalTransactions: transactions.length,
      ingresosMes,
      gastosMes,
      balance: ingresosMes - gastosMes,
    };
  }, [busitos, transactions]);

  return (
    <DashboardShell title="Dashboard" currentPath="/dashboard">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total de Busitos" value={String(metrics.totalBusitos)} subtitle="Unidades registradas" icon="bus" />
        <StatsCard title="Movimientos Recientes" value={String(metrics.totalTransactions)} subtitle="Ultimas transacciones" icon="transactions" />
        <StatsCard title="Ingresos del Mes" value={fmt(metrics.ingresosMes)} subtitle="Entradas del periodo actual" icon="income" />
        <StatsCard title="Gastos del Mes" value={fmt(metrics.gastosMes)} subtitle="Salidas del periodo actual" icon="expense" />
      </section>

      <section>
        <MainCharts />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Transacciones recientes</h2>
              <p className="text-sm text-slate-500">Resumen rapido del movimiento mas reciente</p>
            </div>
            <Link href="/transacciones" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => {
              const isIngreso = tx.type.toLowerCase() === "ingreso" || tx.type.toLowerCase() === "income";
              return (
                <div key={tx.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {tx.busito?.name || "Sin busito"} · {new Date(tx.createdAt).toLocaleDateString(settings.locale)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={`font-semibold ${isIngreso ? "text-emerald-600" : "text-rose-600"}`}>
                      {isIngreso ? "+" : "-"}{fmt(Number(tx.amount))}
                    </p>
                    <p className="text-xs text-slate-500">{isIngreso ? "Ingreso" : "Gasto"}</p>
                  </div>
                </div>
              );
            })}

            {!loading && transactions.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No hay transacciones recientes.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Accesos rapidos</h2>
          <p className="mt-1 text-sm text-slate-500">Administra cada modulo desde su propia seccion.</p>

          <div className="mt-5 space-y-3">
            <Link href="/busitos" className="block rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
              <p className="font-medium text-slate-900">Busitos</p>
              <p className="text-sm text-slate-500">Crear, editar y revisar unidades.</p>
            </Link>
            <Link href="/transacciones" className="block rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
              <p className="font-medium text-slate-900">Transacciones</p>
              <p className="text-sm text-slate-500">Registrar ingresos y gastos por busito.</p>
            </Link>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Balance del mes</p>
              <p className={`mt-1 text-2xl font-semibold ${metrics.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {fmt(metrics.balance)}
              </p>
            </div>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
