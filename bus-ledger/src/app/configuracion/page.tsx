"use client";

import { useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getDisplaySettings, formatMoney } from "@/lib/display-settings";
import { ui } from "@/lib/ui";
import * as toast from "@/lib/toast";

const locales = [
  { value: "es-PA", label: "Español (Panamá)" },
  { value: "es-DO", label: "Español (Rep. Dominicana)" },
  { value: "es-MX", label: "Español (México)" },
  { value: "es-CO", label: "Español (Colombia)" },
  { value: "es-AR", label: "Español (Argentina)" },
  { value: "es-ES", label: "Español (España)" },
  { value: "en-US", label: "English (United States)" },
];
const currencies = [
  { value: "USD", label: "USD — Dólar americano" },
  { value: "PAB", label: "PAB — Balboa panameño" },
  { value: "DOP", label: "DOP — Peso dominicano" },
  { value: "MXN", label: "MXN — Peso mexicano" },
  { value: "COP", label: "COP — Peso colombiano" },
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "EUR", label: "EUR — Euro" },
];

export default function ConfiguracionPage() {
  const init = getDisplaySettings();
  const [locale, setLocale]     = useState(init.locale);
  const [currency, setCurrency] = useState(init.currency);
  const [savingDisplay, setSD]  = useState(false);
  const [pw, setPw]             = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwSt]     = useState<{ ok: boolean; msg: string } | null>(null);
  const [pwLoading, setPwL]     = useState(false);

  const preview = useMemo(() => formatMoney(152340.75, { locale, currency }), [locale, currency]);

  const saveDisplay = async () => {
    setSD(true);
    try {
      const res = await fetch("/api/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, currency }) });
      if (res.ok) {
        const { saveDisplaySettings } = await import("@/lib/display-settings");
        saveDisplaySettings({ locale, currency });
        toast.success("Preferencias guardadas");
      } else { const d = await res.json() as { error?: string }; toast.error(d.error ?? "Error"); }
    } finally { setSD(false); }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSt(null);
    if (pw.next !== pw.confirm) { setPwSt({ ok: false, msg: "Las contraseñas nuevas no coinciden" }); return; }
    if (pw.next.length < 8) { setPwSt({ ok: false, msg: "Mínimo 8 caracteres" }); return; }
    setPwL(true);
    try {
      const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }) });
      const d = await res.json() as { message?: string; error?: string };
      if (!res.ok) { setPwSt({ ok: false, msg: d.error ?? "Error" }); }
      else { setPwSt({ ok: true, msg: d.message ?? "Contraseña actualizada" }); setPw({ current: "", next: "", confirm: "" }); }
    } catch { setPwSt({ ok: false, msg: "Error de conexión" }); }
    finally { setPwL(false); }
  };

  return (
    <DashboardShell title="Configuración" currentPath="/configuracion">
      <div className="max-w-xl space-y-5">
        {/* Display */}
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Formato regional</h2>
            <p className="text-xs text-muted mt-0.5">Idioma y moneda para los valores del panel</p>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className={ui.label}>Idioma y región</label>
              <select value={locale} onChange={(e) => setLocale(e.target.value)} className={ui.select}>
                {locales.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className={ui.label}>Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={ui.select}>
                {currencies.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 px-4 py-3">
              <p className="text-xs text-muted mb-1">Vista previa</p>
              <p className="text-xl font-bold tabular-nums text-ink">{preview}</p>
            </div>
            <button onClick={() => void saveDisplay()} disabled={savingDisplay} className={ui.btn.primary}>
              {savingDisplay ? "Guardando..." : "Guardar preferencias"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className={ui.card}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Cambiar contraseña</h2>
            <p className="text-xs text-muted mt-0.5">Mínimo 8 caracteres con letras y números</p>
          </div>
          <form onSubmit={changePw} className="space-y-4 p-5" noValidate>
            <div>
              <label htmlFor="pw-cur" className={ui.label}>Contraseña actual</label>
              <input id="pw-cur" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" required className={ui.input} />
            </div>
            <div>
              <label htmlFor="pw-new" className={ui.label}>Nueva contraseña</label>
              <input id="pw-new" type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" required className={ui.input} />
            </div>
            <div>
              <label htmlFor="pw-con" className={ui.label}>Confirmar nueva contraseña</label>
              <input id="pw-con" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" required className={ui.input} />
            </div>
            {pwStatus && (
              <p className={`rounded-lg border px-3 py-2.5 text-sm ${pwStatus.ok ? "border-success-100 bg-success-50 text-success-700" : "border-danger-100 bg-danger-50 text-danger"}`}>
                {pwStatus.msg}
              </p>
            )}
            <button type="submit" disabled={pwLoading} className={ui.btn.primary}>{pwLoading ? "Cambiando..." : "Cambiar contraseña"}</button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
