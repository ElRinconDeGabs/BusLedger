export type DisplaySettings = {
  locale: string;
  currency: string;
};

export const DISPLAY_SETTINGS_EVENT = "busledger:display-settings-updated";
const STORAGE_KEY = "busledger.display-settings";

const FALLBACK_SETTINGS: DisplaySettings = {
  locale: "es-PA",
  currency: "USD",
};

const localeCurrencyMap: Record<string, string> = {
  "es-PA": "USD",
  "es-DO": "DOP",
  "es-MX": "MXN",
  "es-ES": "EUR",
  "es-CO": "COP",
  "es-AR": "ARS",
  "en-US": "USD",
};

export function getBrowserDefaults(): DisplaySettings {
  if (typeof window === "undefined") return FALLBACK_SETTINGS;
  const locale = window.navigator.languages?.[0] || window.navigator.language || FALLBACK_SETTINGS.locale;
  return { locale, currency: inferCurrencyFromLocale(locale) };
}

export function inferCurrencyFromLocale(locale: string): string {
  const normalized = locale.trim();
  if (localeCurrencyMap[normalized]) return localeCurrencyMap[normalized];
  const country = normalized.split("-")[1]?.toUpperCase();
  if (country === "PA") return "USD";
  if (country === "DO") return "DOP";
  if (country === "US") return "USD";
  if (country === "MX") return "MXN";
  if (country === "CO") return "COP";
  if (country === "AR") return "ARS";
  if (country === "ES") return "EUR";
  return FALLBACK_SETTINGS.currency;
}

export function getDisplaySettings(): DisplaySettings {
  if (typeof window === "undefined") return FALLBACK_SETTINGS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getBrowserDefaults();
  try {
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    const locale = parsed.locale?.trim() || getBrowserDefaults().locale;
    const currency = parsed.currency?.trim().toUpperCase() || inferCurrencyFromLocale(locale);
    return { locale, currency };
  } catch {
    return getBrowserDefaults();
  }
}

export function saveDisplaySettings(settings: DisplaySettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ locale: settings.locale.trim(), currency: settings.currency.trim().toUpperCase() })
  );
  window.dispatchEvent(new Event(DISPLAY_SETTINGS_EVENT));
}

export function resetDisplaySettingsToBrowser(): DisplaySettings {
  const defaults = getBrowserDefaults();
  saveDisplaySettings(defaults);
  return defaults;
}

export function formatMoney(value: number, settings: DisplaySettings): string {
  try {
    return new Intl.NumberFormat(settings.locale, {
      style: "currency",
      currency: settings.currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}
