"use client";

import { useEffect, useState } from "react";
import { DISPLAY_SETTINGS_EVENT, DisplaySettings, getDisplaySettings } from "@/lib/display-settings";

export function useDisplaySettings(): DisplaySettings {
  const [settings, setSettings] = useState<DisplaySettings>({ locale: "es-DO", currency: "DOP" });

  useEffect(() => {
    setSettings(getDisplaySettings());
  }, []);

  useEffect(() => {
    const refresh = () => setSettings(getDisplaySettings());
    window.addEventListener(DISPLAY_SETTINGS_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(DISPLAY_SETTINGS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return settings;
}
