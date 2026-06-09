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

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconBus() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="14" rx="3" /><path d="M7 17v3M17 17v3M4 10h16" />
      <circle cx="8" cy="20.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="20.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M16 12.5h5M7 6V4.5h9" />
      <circle cx="16" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18M6 16V10M12 16V7M18 16V13" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

const menuItems: MenuItem[] = [
  { label: "Dashboard",      href: "/dashboard",     icon: <IconGrid /> },
  { label: "Busitos",        href: "/busitos",        icon: <IconBus /> },
  { label: "Transacciones",  href: "/transacciones",  icon: <IconWallet /> },
  { label: "Reportes",       href: "/reportes",       icon: <IconChart /> },
  { label: "Configuración",  href: "/configuracion",  icon: <IconSettings /> },
];

const adminItems: MenuItem[] = [
  { label: "Administración", href: "/admin", icon: <IconShield /> },
];

function NavItem({
  item,
  active,
  collapsed,
  onClose,
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onClose}
      style={{
        backgroundColor: active ? "var(--sb-active-bg)" : "transparent",
        color: active ? "var(--sb-active-text)" : "var(--sb-text)",
      }}
      className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-90 ${
        collapsed ? "justify-center" : "gap-3"
      } ${!active ? "hover:bg-[var(--sb-hover)]" : ""}`}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
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
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "oklch(0.13 0.025 255 / 0.5)" }}
          onClick={onClose}
        />
      )}

      <aside
        style={{ background: "var(--sb-bg)", borderRight: "1px solid var(--sb-border)" }}
        className={`fixed left-0 top-0 z-30 flex h-screen flex-col py-4 transition-all duration-200 md:sticky md:translate-x-0 ${
          collapsed ? "md:w-[68px]" : "w-[220px] md:w-[220px]"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className={`mb-6 flex items-center px-3 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div
            style={{ background: "var(--sb-logo-bg)", color: "var(--sb-active-text)" }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold"
          >
            BL
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" style={{ color: "oklch(0.95 0.005 255)" }}>
                Bus Ledger
              </p>
              <p className="truncate text-xs" style={{ color: "var(--sb-muted)" }}>
                {orgName ?? "Cargando..."}
              </p>
            </div>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-0.5 px-2">
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* Admin section */}
        {role === "ADMIN" && (
          <>
            <div
              className="mx-3 my-4"
              style={{ borderTop: "1px solid var(--sb-border)" }}
            />
            <nav className="flex flex-col gap-0.5 px-2">
              {adminItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                  onClose={onClose}
                />
              ))}
            </nav>
          </>
        )}

        {/* Bottom org name (expanded only) */}
        {!collapsed && (
          <div className="mt-auto px-4 pb-1">
            <p className="truncate text-[11px]" style={{ color: "var(--sb-muted)" }}>
              {orgName}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
