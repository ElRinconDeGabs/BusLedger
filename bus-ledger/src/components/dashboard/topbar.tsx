"use client";

import Link from "next/link";
import { useState } from "react";

type User = {
  name: string;
  email: string;
  role?: "ADMIN" | "USER";
};

type TopbarProps = {
  title: string;
  user: User | null;
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  onLogout: () => Promise<void>;
};

export default function Topbar({ title, user, sidebarCollapsed, onMenuClick, onLogout }: TopbarProps) {
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((c) => c[0]).slice(0, 2).join("").toUpperCase()
    : "US";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button type="button" onClick={onMenuClick}
            title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className="hidden rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:inline-flex">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarCollapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>

        <div className="relative">
          <button type="button" onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left shadow-sm transition hover:border-slate-300">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {initials}
              {user?.role === "ADMIN" && (
                <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border border-white bg-amber-400 text-[9px] font-bold text-amber-900">A</span>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-slate-800">{user?.name ?? "Cargando..."}</p>
                {user?.role && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    user.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                  }`}>{user.role}</span>
                )}
              </div>
              <p className="text-xs text-slate-500">{user?.email ?? ""}</p>
            </div>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <Link href="/configuracion" onClick={() => setOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
                  Configuracion
                </Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setOpen(false)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
                    Administración
                  </Link>
                )}
                <div className="my-1 border-t border-slate-100" />
                <button onClick={onLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                  Cerrar sesion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
