"use client";

import Link from "next/link";

type MenuItem = { label: string; href: string; icon: string };
type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  currentPath: string;
  role?: "ADMIN" | "USER";
  orgName?: string;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Busitos", href: "/busitos", icon: "bus" },
  { label: "Transacciones", href: "/transacciones", icon: "wallet" },
  { label: "Reportes", href: "/reportes", icon: "chart" },
  { label: "Configuracion", href: "/configuracion", icon: "settings" },
];

const adminItems: MenuItem[] = [
  { label: "Administración", href: "/admin", icon: "shield" },
];

function Icon({ name }: { name: string }) {
  if (name === "grid") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
  if (name === "bus") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="14" rx="3" /><path d="M7 17v3M17 17v3M4 10h16" />
      <circle cx="8" cy="20" r="1" fill="currentColor" /><circle cx="16" cy="20" r="1" fill="currentColor" />
    </svg>
  );
  if (name === "wallet") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" /><path d="M16 12h5M7 6V4h9" />
    </svg>
  );
  if (name === "chart") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 20h18" /><path d="M6 16v-6M12 16V7M18 16v-3" />
    </svg>
  );
  if (name === "shield") return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 1 1-1.4 1.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19a1 1 0 1 1-2 0v-.1a1 1 0 0 0-.7-.9 1 1 0 0 0-1 .2l-.1.1a1 1 0 0 1-1.4-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5a1 1 0 1 1 0-2h.1a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1l-.1-.1a1 1 0 1 1 1.4-1.4l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V5a1 1 0 1 1 2 0v.1a1 1 0 0 0 .7.9 1 1 0 0 0 1-.2l.1-.1a1 1 0 1 1 1.4 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H19a1 1 0 1 1 0 2h-.1a1 1 0 0 0-.9.7 1 1 0 0 0 .2 1Z" />
    </svg>
  );
}

function NavItem({ item, active, collapsed, onClose }: { item: MenuItem; active: boolean; collapsed: boolean; onClose: () => void }) {
  return (
    <Link href={item.href} title={collapsed ? item.label : undefined}
      className={`flex items-center rounded-xl px-3 py-2 text-sm transition ${
        active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } ${collapsed ? "justify-center" : "gap-3"}`}
      onClick={onClose}>
      <Icon name={item.icon} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ open, collapsed, onClose, currentPath, role, orgName }: SidebarProps) {
  const isActive = (href: string) => currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <>
      {open && <div className="fixed inset-0 z-10 bg-slate-900/35 md:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-20 flex h-screen flex-col border-r border-slate-200 bg-white px-3 py-5 transition-all md:sticky md:translate-x-0 ${
        collapsed ? "md:w-20" : "w-60 md:w-60"
      } ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`mb-7 flex items-center px-2 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">BL</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">Bus Ledger</p>
              <p className="truncate text-xs text-slate-500">{orgName ?? "Cargando..."}</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onClose={onClose} />
          ))}
        </nav>

        {role === "ADMIN" && (
          <>
            {!collapsed
              ? <p className="mx-3 mt-5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Admin</p>
              : <div className="my-3 mx-3 border-t border-slate-200" />
            }
            <nav className="flex flex-col gap-1">
              {adminItems.map((item) => (
                <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onClose={onClose} />
              ))}
            </nav>
          </>
        )}

        {!collapsed && (
          <div className="mt-auto border-t border-slate-100 pt-3 px-2">
            <p className="truncate text-[11px] text-slate-400">{orgName ?? ""}</p>
          </div>
        )}
      </aside>
    </>
  );
}
