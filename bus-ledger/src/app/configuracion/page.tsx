"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
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

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwStatus(null);

    if (pwForm.next !== pwForm.confirm) {
      setPwStatus({ ok: false, msg: "Las contraseñas nuevas no coinciden" });
      return;
    }

    if (!PASSWORD_POLICY.test(pwForm.next)) {
      setPwStatus({ ok: false, msg: "La nueva contraseña debe tener 8 a 20 caracteres, letras y numeros, sin caracteres especiales" });
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });

      const data = await res.json() as { message?: string; error?: string };

      if (!res.ok) {
        setPwStatus({ ok: false, msg: data.error ?? "Error al cambiar contraseña" });
      } else {
        setPwStatus({ ok: true, msg: data.message ?? "Contraseña actualizada" });
        setPwForm({ current: "", next: "", confirm: "" });
      }
    } catch {
      setPwStatus({ ok: false, msg: "Error de conexion" });
    } finally {
      setPwLoading(false);
    }
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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-slate-500">Ingresa tu contraseña actual y luego la nueva.</p>

        <form onSubmit={handleChangePassword} className="mt-5 space-y-3" noValidate>
          <div>
            <label htmlFor="pw-current" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Contraseña actual
            </label>
            <input
              id="pw-current"
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((old) => ({ ...old, current: e.target.value }))}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="pw-next" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Nueva contraseña
            </label>
            <input
              id="pw-next"
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((old) => ({ ...old, next: e.target.value }))}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-400">8-20 caracteres, letras y numeros, sin caracteres especiales.</p>
          </div>

          <div>
            <label htmlFor="pw-confirm" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Confirmar nueva contraseña
            </label>
            <input
              id="pw-confirm"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((old) => ({ ...old, confirm: e.target.value }))}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-100 focus:border-blue-500 focus:ring-2"
            />
          </div>

          {pwStatus && (
            <div className={`rounded-xl px-3 py-2 text-sm ${pwStatus.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {pwStatus.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pwLoading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
