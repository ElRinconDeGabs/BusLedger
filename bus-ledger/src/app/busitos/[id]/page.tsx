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
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
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
  const [plateNumber, setPlateNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

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
    setPlateNumber(data.plateNumber ?? "");
    setCapacity(data.capacity ? String(data.capacity) : "");
    setModel(data.model ?? "");
    setYear(data.year ? String(data.year) : "");
  };

  const saveBusito = async () => {
    const res = await fetch(`/api/busitos/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        plateNumber: plateNumber.trim(),
        capacity: capacity ? Number(capacity) : null,
        model: model.trim(),
        year: year ? Number(year) : null,
      }),
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
      <div className="space-y-5">
        <div>
          <Link
            href="/busitos"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Volver a busitos
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{busito.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Transacciones asociadas a esta unidad.</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 md:text-right">
              {busito.transactions.length} movimiento{busito.transactions.length === 1 ? "" : "s"} registrado{busito.transactions.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Ingresos</p>
              <p className="text-xl font-semibold text-emerald-800">{fmt(totals.ingresos)}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Gastos</p>
              <p className="text-xl font-semibold text-rose-800">{fmt(totals.gastos)}</p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
              <p className="text-xs text-cyan-700">Balance</p>
              <p className="text-xl font-semibold text-cyan-800">{fmt(totals.balance)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Transacciones del busito</h2>
              <p className="text-sm text-slate-500">Movimientos de ingresos y gastos de esta unidad.</p>
            </div>
            <Link
              href="/transacciones"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Editar busito</h2>
            <p className="mt-1 text-sm text-slate-500">Actualiza nombre y descripcion sin recargar la pagina.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="detail-name" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Nombre
              </label>
              <input
                id="detail-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="detail-description" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Descripcion
              </label>
              <input
                id="detail-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label htmlFor="detail-plate" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Placa
              </label>
              <input
                id="detail-plate"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label htmlFor="detail-capacity" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Capacidad
              </label>
              <input
                id="detail-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label htmlFor="detail-model" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Modelo
              </label>
              <input
                id="detail-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label htmlFor="detail-year" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Ano
              </label>
              <input
                id="detail-year"
                type="number"
                min={1980}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
                placeholder="Opcional"
              />
            </div>
          </div>

          <button onClick={saveBusito} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Guardar cambios
          </button>
        </section>
      </div>
    </DashboardShell>
  );
}
