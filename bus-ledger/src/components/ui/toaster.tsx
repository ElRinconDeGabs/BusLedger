"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT, ToastType } from "@/lib/toast";

type ToastItem = { id: number; type: ToastType; message: string };

const toastStyles: Record<ToastType, string> = {
  success: "border-success-100 bg-success-50 text-success-700",
  error:   "border-danger-100 bg-danger-50 text-danger",
  info:    "border-brand-200 bg-brand-50 text-brand-700",
};

const toastIcons: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "i",
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<ToastItem>).detail;
      setToasts((prev) => [...prev, item]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== item.id)), 3500);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[320px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-lg ${toastStyles[t.type]}`}
        >
          <span className="shrink-0 text-xs font-bold">{toastIcons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
