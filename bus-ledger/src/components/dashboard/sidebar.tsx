"use client";

import Link from "next/link";

type MenuItem = { label: string; href: string; icon: React.ReactNode };
type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  currentPath: string;
  role?: "ADMIN" | "USER";
  orgName?: string;
};

const icons = {
  dashboard: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  ),
  bus: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2.5" width="14" height="11" rx="2.5" /><path d="M6 13.5v3M14 13.5v3M3 8.5h14" />
      <circle cx="6.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="16" height="11" rx="2" /><path d="M14 10.5h4M6 5V3.5h8" />
      <circle cx="14" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17h16M5 13V9M10 13V6M15 13V11" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.22 4.22l1.06 1.06M14.72 14.72l1.06 1.06M4.22 15.78l1.06-1.06M14.72 5.28l1.06-1.06" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 1.5L3 4.5v5c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5v-5L10 1.5z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  ),
};

const menuItems: MenuItem[] = [
  { label: "Dashboard",     href: "/dashboard",    icon: icons.dashboard },
  { label: "Busitos",       href: "/busitos",       icon: icons.bus },
  { label: "Transacciones", href: "/transacciones", icon: icons.wallet },
  { label: "Reportes",      href: "/reportes",      icon: icons.chart },
  { label: "Configuración", href: "/configuracion", icon: icons.settings },
];

const adminItems: MenuItem[] = [
  { label: "Administración", href: "/admin", icon: icons.shield },
];

function NavItem({ item, active, collapsed, onClose }: { item: MenuItem; active: boolean; collapsed: boolean; onClose: () => void }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onClose}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
        ${collapsed ? "justify-center px-2" : ""}
        ${active
          ? "bg-brand-50 text-brand-600"
          : "text-muted hover:bg-surface-2 hover:text-ink"
        }
      `}
    >
      <span className={`shrink-0 ${active ? "text-brand-600" : ""}`}>{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ open, collapsed, onClose, currentPath, role, orgName }: SidebarProps) {
  const isActive = (href: string) =>
    currentPath === href || (href !== "/dashboard" && currentPath.startsWith(`${href}/`));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-ink/30 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-surface
          transition-all duration-200
          md:sticky md:translate-x-0
          ${collapsed ? "md:w-[64px]" : "w-[240px] md:w-[240px]"}
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className={`flex h-14 items-center border-b border-border px-4 ${collapsed ? "justify-center px-0" : "gap-2.5"}`}>
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-[13px] font-bold text-white">
            BL
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">Bus Ledger</p>
              <p className="truncate text-xs text-muted">{orgName ?? ""}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-3 flex-1">
          {menuItems.map((item) => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onClose={onClose} />
          ))}

          {role === "ADMIN" && (
            <>
              <div className="my-2 border-t border-border" />
              {adminItems.map((item) => (
                <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} onClose={onClose} />
              ))}
            </>
          )}
        </nav>

        {/* Footer org label */}
        {!collapsed && orgName && (
          <div className="border-t border-border px-4 py-3">
            <p className="truncate text-[11px] text-faint">{orgName}</p>
          </div>
        )}
      </aside>
    </>
  );
}
