"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT, ToastType } from "@/lib/toast";

type ToastItem = { id: number; type: ToastType; message: string };

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent).detail as ToastItem;
      setToasts((prev) => [...prev, item]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== item.id)), 3500);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : t.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <span className="shrink-0 text-base">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
