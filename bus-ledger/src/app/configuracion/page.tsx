"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  getBrowserDefaults,
  getDisplaySettings,
  resetDisplaySettingsToBrowser,
  saveDisplaySettings,
  formatMoney,
} from "@/lib/display-settings";

const localeOptions = [
  { value: "es-DO", label: "Espanol (Republica Dominicana)" },
  { value: "es-MX", label: "Espanol (Mexico)" },
  { value: "es-CO", label: "Espanol (Colombia)" },
  { value: "es-AR", label: "Espanol (Argentina)" },
  { value: "es-ES", label: "Espanol (Espana)" },
  { value: "en-US", label: "English (United States)" },
];

const currencyOptions = [
  { value: "DOP", label: "DOP - Peso dominicano" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Peso mexicano" },
  { value: "COP", label: "COP - Peso colombiano" },
  { value: "ARS", label: "ARS - Peso argentino" },
];

export default function ConfiguracionPage() {
  const initial = getDisplaySettings();

  const [locale, setLocale] = useState(initial.locale);
  const [currency, setCurrency] = useState(initial.currency);
  const [saved, setSaved] = useState(false);

  const browserDefaults = useMemo(() => getBrowserDefaults(), []);
  const preview = useMemo(() => formatMoney(152340.75, { locale, currency }), [locale, currency]);

  const handleSave = () => {
    saveDisplaySettings({ locale, currency });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleReset = () => {
    const defaults = resetDisplaySettingsToBrowser();
    setLocale(defaults.locale);
    setCurrency(defaults.currency);
    setSaved(false);
  };

  return (
    <DashboardShell title="Configuracion" currentPath="/configuracion">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Configuracion</h1>
            <p className="mt-2 text-sm text-slate-500">Personaliza formato regional y moneda del dashboard.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Volver al dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Formato regional</h2>
            <label className="mt-3 block text-xs font-medium text-slate-500">Idioma y region</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              {localeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Moneda</h2>
            <label className="mt-3 block text-xs font-medium text-slate-500">Moneda principal</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              {currencyOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Vista previa</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">{preview}</p>
          <p className="mt-1 text-xs text-blue-700">
            Detectado por navegador: {browserDefaults.locale} / {browserDefaults.currency}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Guardar ajustes
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Usar valores del navegador
          </button>
          {saved && <span className="text-sm font-medium text-emerald-600">Guardado</span>}
        </div>
      </section>
    </DashboardShell>
  );
}
