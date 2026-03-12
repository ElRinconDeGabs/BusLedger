"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { formatMoney } from "@/lib/display-settings";
import { useDisplaySettings } from "@/lib/use-display-settings";

type Busito = {
  id: number;
  name: string;
};

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

export default function TransaccionesPage() {
  const settings = useDisplaySettings();
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({ description: "", amount: "", type: "ingreso", busitoId: "" });

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    const [busitosRes, transactionsRes] = await Promise.all([fetch("/api/busitos"), fetch("/api/transactions")]);

    if (busitosRes.ok) {
      const busitosData = (await busitosRes.json()) as Busito[];
      setBusitos(busitosData);
      setForm((old) => ({ ...old, busitoId: old.busitoId || String(busitosData[0]?.id || "") }));
    }

    if (transactionsRes.ok) {
      setTransactions((await transactionsRes.json()) as Transaction[]);
    }
  };

  const fmt = (n: number) => formatMoney(n, settings);

  const createTransaction = async () => {
    if (!form.description.trim() || !form.amount || !form.busitoId) return;

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: form.description,
        amount: Number(form.amount),
        type: form.type,
        busitoId: Number(form.busitoId),
      }),
    });

    if (res.ok) {
      setForm((old) => ({ ...old, description: "", amount: "" }));
      await bootstrap();
    }
  };

  const deleteTransaction = async (id: number) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) await bootstrap();
  };

  const editTransaction = async (tx: Transaction) => {
    const description = window.prompt("Descripcion", tx.description);
    if (description === null) return;
    const amount = window.prompt("Monto", String(tx.amount));
    if (amount === null) return;
    const type = window.prompt("Tipo (ingreso o gasto)", tx.type);
    if (type === null) return;

    const res = await fetch(`/api/transactions/${tx.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount: Number(amount), type }),
    });

    if (res.ok) await bootstrap();
  };

  return (
    <DashboardShell title="Transacciones" currentPath="/transacciones">
      <section className="grid gap-6 lg:grid-cols-[0.95fr,1.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Registrar movimiento</h2>
          <p className="mt-1 text-sm text-slate-500">Agrega ingresos o gastos ligados a un busito.</p>

          <div className="mt-4 space-y-3">
            <input
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) => setForm((old) => ({ ...old, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
            <input
              type="number"
              placeholder="Monto"
              value={form.amount}
              onChange={(e) => setForm((old) => ({ ...old, amount: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
            <select
              value={form.type}
              onChange={(e) => setForm((old) => ({ ...old, type: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
            <select
              value={form.busitoId}
              onChange={(e) => setForm((old) => ({ ...old, busitoId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            >
              <option value="">Selecciona un busito</option>
              {busitos.map((busito) => (
                <option key={busito.id} value={busito.id}>
                  {busito.name}
                </option>
              ))}
            </select>
            <button onClick={createTransaction} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
              Guardar transaccion
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Historial de transacciones</h2>
            <p className="text-sm text-slate-500">Gestion completa de ingresos y gastos.</p>
          </div>

          <div className="space-y-3 md:hidden">
            {transactions.map((tx) => {
              const isIngreso = tx.type.toLowerCase() === "ingreso" || tx.type.toLowerCase() === "income";
              return (
                <article key={tx.id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{tx.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString(settings.locale)} · {tx.busito?.name || "Sin busito"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${isIngreso ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {isIngreso ? "Ingreso" : "Gasto"}
                    </span>
                  </div>

                  <p className={`mt-4 text-lg font-semibold ${isIngreso ? "text-emerald-600" : "text-rose-600"}`}>
                    {isIngreso ? "+" : "-"}{fmt(Number(tx.amount))}
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => editTransaction(tx)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}

            {transactions.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No hay transacciones registradas.
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Descripcion</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Monto</th>
                  <th className="px-3 py-2 font-medium">Busito</th>
                  <th className="px-3 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => {
                  const isIngreso = tx.type.toLowerCase() === "ingreso" || tx.type.toLowerCase() === "income";
                  return (
                    <tr key={tx.id} className={`${index % 2 ? "bg-slate-50/70" : "bg-white"} border-b border-slate-100 hover:bg-blue-50/40`}>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600">{new Date(tx.createdAt).toLocaleDateString(settings.locale)}</td>
                      <td className="px-3 py-2 text-slate-700">{tx.description}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${isIngreso ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {isIngreso ? "Ingreso" : "Gasto"}
                        </span>
                      </td>
                      <td className={`px-3 py-2 font-medium ${isIngreso ? "text-emerald-600" : "text-rose-600"}`}>
                        {isIngreso ? "+" : "-"}{fmt(Number(tx.amount))}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{tx.busito?.name || "Sin busito"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button onClick={() => editTransaction(tx)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100">
                            Editar
                          </button>
                          <button onClick={() => deleteTransaction(tx.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                      No hay transacciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
