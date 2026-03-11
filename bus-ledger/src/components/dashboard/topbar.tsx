"use client";

import Link from "next/link";
import { useState } from "react";

type User = {
  name: string;
  email: string;
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
    ? user.name
        .split(" ")
        .map((chunk) => chunk[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMenuClick}
            className="hidden rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:inline-flex"
            aria-label="Colapsar sidebar"
            title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarCollapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((old) => !old)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left shadow-sm"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">{initials}</div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name ?? "Cargando..."}</p>
              <p className="text-xs text-slate-500">{user?.email ?? ""}</p>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <Link href="/dashboard" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
                Perfil
              </Link>
              <Link href="/configuracion" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
                Configuracion
              </Link>
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                onClick={onLogout}
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
