"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import BusitoCard from "@/components/dashboard/busito-card";

type Busito = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
};

export default function BusitosPage() {
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBusito, setNewBusito] = useState({ name: "", description: "" });

  useEffect(() => {
    void fetchBusitos();
  }, []);

  const fetchBusitos = async () => {
    try {
      const res = await fetch("/api/busitos");
      if (!res.ok) {
        setBusitos([]);
        return;
      }
      setBusitos((await res.json()) as Busito[]);
    } finally {
      setLoading(false);
    }
  };

  const createBusito = async () => {
    if (!newBusito.name.trim()) return;

    const res = await fetch("/api/busitos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBusito),
    });

    if (res.ok) {
      setNewBusito({ name: "", description: "" });
      await fetchBusitos();
    }
  };

  const deleteBusito = async (id: number) => {
    const res = await fetch(`/api/busitos/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchBusitos();
    }
  };

  return (
    <DashboardShell title="Busitos" currentPath="/busitos">
      <section className="grid gap-6 lg:grid-cols-[0.95fr,1.75fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Crear busito</h2>
          <p className="mt-1 text-sm text-slate-500">Registra una unidad para separar sus ingresos y gastos.</p>

          <div className="mt-4 space-y-3">
            <input
              placeholder="Nombre del busito"
              value={newBusito.name}
              onChange={(e) => setNewBusito((old) => ({ ...old, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
            />
            <textarea
              placeholder="Descripcion opcional"
              value={newBusito.description}
              onChange={(e) => setNewBusito((old) => ({ ...old, description: e.target.value }))}
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
            />
            <button onClick={createBusito} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
              Guardar busito
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Listado de busitos</h2>
            <p className="text-sm text-slate-500">Cada tarjeta entra a la vista individual del busito.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {busitos.map((busito) => (
              <BusitoCard
                key={busito.id}
                id={busito.id}
                name={busito.name}
                description={busito.description}
                createdAt={busito.createdAt}
                onDelete={deleteBusito}
              />
            ))}
            {!loading && busitos.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Aun no hay busitos registrados.
              </div>
            )}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
