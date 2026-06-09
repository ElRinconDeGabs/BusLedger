"use client";

import { useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getDisplaySettings, formatMoney } from "@/lib/display-settings";
import * as toast from "@/lib/toast";

const localeOptions = [
  { value: "es-PA", label: "Español (Panamá)" },
  { value: "es-DO", label: "Español (Rep. Dominicana)" },
  { value: "es-MX", label: "Español (México)" },
  { value: "es-CO", label: "Español (Colombia)" },
  { value: "es-AR", label: "Español (Argentina)" },
  { value: "es-ES", label: "Español (España)" },
  { value: "en-US", label: "English (United States)" },
];

const currencyOptions = [
  { value: "USD", label: "USD — Dólar americano" },
  { value: "PAB", label: "PAB — Balboa panameño" },
  { value: "DOP", label: "DOP — Peso dominicano" },
  { value: "MXN", label: "MXN — Peso mexicano" },
  { value: "COP", label: "COP — Peso colombiano" },
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "EUR", label: "EUR — Euro" },
];

export default function ConfiguracionPage() {
  const initial = getDisplaySettings();
  const [locale, setLocale] = useState(initial.locale);
  const [currency, setCurrency] = useState(initial.currency);
  const [savingDisplay, setSavingDisplay] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const preview = useMemo(() => formatMoney(152340.75, { locale, currency }), [locale, currency]);

  const handleSaveDisplay = async () => {
    setSavingDisplay(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, currency }),
      });
      if (res.ok) {
        // Also sync to localStorage
        const { saveDisplaySettings } = await import("@/lib/display-settings");
        saveDisplaySettings({ locale, currency });
        toast.success("Preferencias guardadas");
      } else {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Error al guardar");
      }
    } finally {
      setSavingDisplay(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);

    if (pwForm.next !== pwForm.confirm) {
      setPwStatus({ ok: false, msg: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwStatus({ ok: false, msg: "La contraseña debe tener al menos 8 caracteres" });
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
      setPwStatus({ ok: false, msg: "Error de conexión" });
    } finally {
      setPwLoading(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100";
  const labelCls = "block text-sm font-medium text-ink mb-1.5";

  return (
    <DashboardShell title="Configuración" currentPath="/configuracion">
      <div className="max-w-2xl space-y-5">
        {/* Display settings */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-ink mb-1">Formato regional</h2>
          <p className="text-sm text-muted mb-5">Idioma y moneda para mostrar los valores en el panel.</p>

          <div className="grid gap-4 sm:grid-cols-2 mb-5">
            <div>
              <label className={labelCls}>Idioma y región</label>
              <select value={locale} onChange={(e) => setLocale(e.target.value)} className={inputCls}>
                {localeOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                {currencyOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 mb-4">
            <p className="text-xs text-brand-700 mb-0.5">Vista previa</p>
            <p className="text-xl font-bold tabular-nums text-brand-700">{preview}</p>
          </div>

          <button
            onClick={() => void handleSaveDisplay()}
            disabled={savingDisplay}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-900 transition hover:opacity-90 disabled:opacity-60"
          >
            {savingDisplay ? "Guardando..." : "Guardar preferencias"}
          </button>
        </div>

        {/* Change password */}
        <div className="rounded-[10px] border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-ink mb-1">Cambiar contraseña</h2>
          <p className="text-sm text-muted mb-5">Ingresa tu contraseña actual y la nueva contraseña.</p>

          <form onSubmit={handleChangePassword} className="space-y-3" noValidate>
            <div>
              <label htmlFor="pw-current" className={labelCls}>Contraseña actual</label>
              <input
                id="pw-current"
                type="password"
                value={pwForm.current}
                onChange={(e) => setPwForm((old) => ({ ...old, current: e.target.value }))}
                autoComplete="current-password"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pw-next" className={labelCls}>Nueva contraseña</label>
              <input
                id="pw-next"
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwForm((old) => ({ ...old, next: e.target.value }))}
                autoComplete="new-password"
                required
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted">Mínimo 8 caracteres con letras y números.</p>
            </div>
            <div>
              <label htmlFor="pw-confirm" className={labelCls}>Confirmar nueva contraseña</label>
              <input
                id="pw-confirm"
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((old) => ({ ...old, confirm: e.target.value }))}
                autoComplete="new-password"
                required
                className={inputCls}
              />
            </div>

            {pwStatus && (
              <div className={`rounded-lg px-3 py-2.5 text-sm ${pwStatus.ok ? "border border-success-100 bg-success-50 text-success-700" : "border border-danger-100 bg-danger-50 text-danger"}`}>
                {pwStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-surface transition hover:opacity-80 disabled:opacity-60"
            >
              {pwLoading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
