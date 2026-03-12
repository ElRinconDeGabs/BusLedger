"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import BusitoCard from "@/components/dashboard/busito-card";

type Busito = {
  id: number;
  name: string;
  description?: string;
  plateNumber?: string;
  capacity?: number;
  model?: string;
  year?: number;
  createdAt: string;
};

export default function BusitosPage() {
  const [busitos, setBusitos] = useState<Busito[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBusito, setNewBusito] = useState({
    name: "",
    description: "",
    plateNumber: "",
    capacity: "",
    model: "",
    year: "",
  });

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

  const createBusito = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBusito.name.trim()) return;

    setCreating(true);

    const res = await fetch("/api/busitos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newBusito.name.trim(),
        description: newBusito.description.trim(),
        plateNumber: newBusito.plateNumber.trim(),
        capacity: newBusito.capacity ? Number(newBusito.capacity) : null,
        model: newBusito.model.trim(),
        year: newBusito.year ? Number(newBusito.year) : null,
      }),
    });

    if (res.ok) {
      setNewBusito({
        name: "",
        description: "",
        plateNumber: "",
        capacity: "",
        model: "",
        year: "",
      });
      setShowCreateForm(false);
      await fetchBusitos();
    }

    setCreating(false);
  };

  const deleteBusito = async (id: number) => {
    const res = await fetch(`/api/busitos/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchBusitos();
    }
  };

  return (
    <DashboardShell title="Busitos" currentPath="/busitos">
      <section className="space-y-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Busitos registrados</h2>
              <p className="text-sm text-slate-500">Selecciona una tarjeta para abrir su detalle y movimientos.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                {busitos.length} total
              </span>
              <button
                type="button"
                onClick={() => setShowCreateForm((old) => !old)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              >
                {showCreateForm ? "Cerrar formulario" : "Nuevo busito"}
              </button>
              <button
                type="button"
                onClick={() => void fetchBusitos()}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Actualizar
              </button>
            </div>
          </div>

          {showCreateForm && (
            <form className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4" onSubmit={createBusito}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Nuevo busito</p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label htmlFor="busito-name" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Nombre
                  </label>
                  <input
                    id="busito-name"
                    placeholder="Ej: Ruta Centro 12"
                    value={newBusito.name}
                    onChange={(e) => setNewBusito((old) => ({ ...old, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="busito-plate" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Placa
                  </label>
                  <input
                    id="busito-plate"
                    placeholder="Ej: A123456"
                    value={newBusito.plateNumber}
                    onChange={(e) => setNewBusito((old) => ({ ...old, plateNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
                  />
                </div>

                <div>
                  <label htmlFor="busito-capacity" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Capacidad
                  </label>
                  <input
                    id="busito-capacity"
                    type="number"
                    min={1}
                    placeholder="Ej: 30"
                    value={newBusito.capacity}
                    onChange={(e) => setNewBusito((old) => ({ ...old, capacity: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
                  />
                </div>

                <div>
                  <label htmlFor="busito-model" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Modelo
                  </label>
                  <input
                    id="busito-model"
                    placeholder="Ej: Hyundai County"
                    value={newBusito.model}
                    onChange={(e) => setNewBusito((old) => ({ ...old, model: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
                  />
                </div>

                <div>
                  <label htmlFor="busito-year" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Año
                  </label>
                  <input
                    id="busito-year"
                    type="number"
                    min={1980}
                    max={2100}
                    placeholder="Ej: 2018"
                    value={newBusito.year}
                    onChange={(e) => setNewBusito((old) => ({ ...old, year: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="busito-description" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Descripcion
                  </label>
                  <textarea
                    id="busito-description"
                    placeholder="Opcional"
                    value={newBusito.description}
                    onChange={(e) => setNewBusito((old) => ({ ...old, description: e.target.value }))}
                    className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-2"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {busitos.map((busito) => (
              <BusitoCard
                key={busito.id}
                id={busito.id}
                name={busito.name}
                description={busito.description}
                plateNumber={busito.plateNumber}
                capacity={busito.capacity}
                model={busito.model}
                year={busito.year}
                createdAt={busito.createdAt}
                onDelete={deleteBusito}
              />
            ))}
            {!loading && busitos.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 md:col-span-2 2xl:col-span-3">
                Aun no hay busitos registrados.
              </div>
            )}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
