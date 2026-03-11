"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";
import DashboardShell from "@/components/dashboard/dashboard-shell";

type Transaction = {
  id: number;
  amount: number;
  description: string;
  type: string;
  createdAt: string;
};

type BusitoDetail = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  transactions: Transaction[];
};

export default function BusitoDetailPage() {
  const router = useRouter();
  const settings = useDisplaySettings();
  const params = useParams<{ id: string }>();
  const [busito, setBusito] = useState<BusitoDetail | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    void fetchBusito();
  }, [params.id]);

  const fetchBusito = async () => {
    const res = await fetch(`/api/busitos/${params.id}`);
    if (!res.ok) {
      router.push("/dashboard");
      return;
    }

    const data = (await res.json()) as BusitoDetail;
    setBusito(data);
    setName(data.name);
    setDescription(data.description ?? "");
  };

  const saveBusito = async () => {
    const res = await fetch(`/api/busitos/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) await fetchBusito();
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const totals = useMemo(() => {
    if (!busito) return { ingresos: 0, gastos: 0, balance: 0 };

    const ingresos = busito.transactions
      .filter((tx) => tx.type.toLowerCase() === "ingreso" || tx.type.toLowerCase() === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const gastos = busito.transactions
      .filter((tx) => tx.type.toLowerCase() !== "ingreso" && tx.type.toLowerCase() !== "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { ingresos, gastos, balance: ingresos - gastos };
  }, [busito]);

  if (!busito) {
    return (
      <DashboardShell title="Detalle de busito" currentPath="/busitos">
        <div className="text-sm text-slate-500">Cargando busito...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={busito.name} currentPath="/busitos">
      <div className="space-y-6">
        <div>
          <Link
            href="/busitos"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Volver a busitos
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{busito.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Vista segmentada de las transacciones exclusivas de este busito.</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 md:text-right">
              {busito.transactions.length} movimiento{busito.transactions.length === 1 ? "" : "s"} registrado{busito.transactions.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Ingresos</p>
              <p className="text-xl font-semibold text-emerald-800">{fmt(totals.ingresos)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Gastos</p>
              <p className="text-xl font-semibold text-rose-800">{fmt(totals.gastos)}</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-3">
              <p className="text-xs text-cyan-700">Balance</p>
              <p className="text-xl font-semibold text-cyan-800">{fmt(totals.balance)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Transacciones del busito</h2>
              <p className="text-sm text-slate-500">Aqui solo se muestran ingresos y gastos asociados a esta unidad.</p>
            </div>
            <Link
              href="/transacciones"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ir a transacciones
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Descripcion</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {busito.transactions.map((tx, i) => (
                  <tr key={tx.id} className={`${i % 2 ? "bg-slate-50" : "bg-white"} border-b border-slate-100`}>
                    <td className="px-3 py-2">{new Date(tx.createdAt).toLocaleDateString(settings.locale)}</td>
                    <td className="px-3 py-2">{tx.description}</td>
                    <td className="px-3 py-2">{tx.type}</td>
                    <td className="px-3 py-2 font-medium">{fmt(tx.amount)}</td>
                  </tr>
                ))}
                {busito.transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                      Este busito aun no tiene transacciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Editar datos del busito</h2>
          <p className="mt-1 text-sm text-slate-500">Configuracion basica de esta unidad.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
              placeholder="Descripcion"
            />
          </div>
          <button onClick={saveBusito} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Guardar cambios
          </button>
        </section>
      </div>
    </DashboardShell>
  );
}
