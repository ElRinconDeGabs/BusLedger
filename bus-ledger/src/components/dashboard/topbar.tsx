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

export default function Topbar({ title, user, sidebarCollapsed, onMenuClick, onLogout }: TopbarProps) {
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((c) => c[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink md:hidden"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={onMenuClick}
          title={sidebarCollapsed ? "Expandir" : "Colapsar"}
          className="hidden h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink md:grid"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {sidebarCollapsed
              ? <path d="M8 5l5 5-5 5" />
              : <path d="M12 5l-5 5 5 5" />}
          </svg>
        </button>

        <h1 className="truncate text-base font-semibold text-ink">{title}</h1>
      </div>

      {/* User menu */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm transition hover:border-border-2 hover:bg-surface-2"
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-ink leading-none">{user?.name ?? "..."}</p>
          </div>
          {user?.role === "ADMIN" && (
            <span className="hidden rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 sm:block">
              Admin
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-lg shadow-ink/5">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/configuracion"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-2"
                >
                  Configuración
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-2"
                  >
                    Administración
                  </Link>
                )}
              </div>
              <div className="border-t border-border p-1">
                <button
                  onClick={() => { setOpen(false); void onLogout(); }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger-50"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
