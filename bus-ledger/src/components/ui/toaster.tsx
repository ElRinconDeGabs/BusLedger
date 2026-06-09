"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT, ToastType } from "@/lib/toast";

type ToastItem = { id: number; type: ToastType; message: string };

const cfg: Record<ToastType, { cls: string; icon: string }> = {
  success: { cls: "border-success-100 bg-success-50 text-success-700", icon: "✓" },
  error:   { cls: "border-danger-100 bg-danger-50 text-danger",         icon: "✕" },
  info:    { cls: "border-brand-200 bg-brand-50 text-brand-600",        icon: "i" },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<ToastItem>).detail;
      setToasts((p) => [...p, item]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== item.id)), 3500);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: "min(340px, calc(100vw - 2rem))" }}>
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-lg shadow-ink/5 ${cfg[t.type].cls}`}>
          <span className="shrink-0 text-xs font-bold">{cfg[t.type].icon}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
