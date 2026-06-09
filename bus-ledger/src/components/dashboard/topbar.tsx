"use client";

import Link from "next/link";
import { useState } from "react";

type User = { name: string; email: string; role?: "ADMIN" | "USER" };
type TopbarProps = {
  title: string;
  user: User | null;
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  onLogout: () => Promise<void>;
};

function MenuIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {collapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
    </svg>
  );
}

export default function Topbar({ title, user, sidebarCollapsed, onMenuClick, onLogout }: TopbarProps) {
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((c) => c[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        {/* Left: toggle + title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-border p-2 text-muted transition hover:text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onMenuClick}
            title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className="hidden rounded-lg border border-border p-2 text-muted transition hover:text-ink md:inline-flex"
          >
            <MenuIcon collapsed={sidebarCollapsed} />
          </button>

          <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        </div>

        {/* Right: user menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 transition hover:border-border-2"
          >
            <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-brand-900">
              {initials}
              {user?.role === "ADMIN" && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-surface bg-brand text-[8px] font-black text-brand-900 ring-1 ring-brand-200">
                  A
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-ink leading-tight">{user?.name ?? "..."}</p>
              <p className="text-xs text-muted leading-tight">{user?.email ?? ""}</p>
            </div>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-border bg-surface py-1 shadow-lg shadow-ink/8">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
                <Link
                  href="/configuracion"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm text-ink hover:bg-bg"
                >
                  Configuración
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm text-ink hover:bg-bg"
                  >
                    Administración
                  </Link>
                )}
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => { setOpen(false); void onLogout(); }}
                  className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger-50"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
