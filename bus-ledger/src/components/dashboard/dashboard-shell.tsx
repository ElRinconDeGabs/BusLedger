"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";
import Toaster from "@/components/ui/toaster";
import { saveDisplaySettings } from "@/lib/display-settings";

const SIDEBAR_COLLAPSED_KEY = "busledger.sidebar-collapsed";

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  organizationId: number;
  organizationName: string;
  locale: string;
  currency: string;
};

type DashboardShellProps = {
  title: string;
  currentPath: string;
  children: ReactNode;
};

export default function DashboardShell({ title, currentPath, children }: DashboardShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    void fetchUser();
    const saved = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  const fetchUser = async () => {
    const res = await fetch("/api/me");
    if (!res.ok) { router.push("/login"); return; }
    const data = (await res.json()) as AppUser;
    setUser(data);
    // Sync server preferences to localStorage so existing hooks work
    saveDisplaySettings({ locale: data.locale, currency: data.currency });
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setSidebarCollapsed((old) => {
        const next = !old;
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
        return next;
      });
      return;
    }
    setMenuOpen((old) => !old);
  };

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-bg text-ink">
      <div className="flex min-h-[100svh] w-full items-stretch">
        <Sidebar
          open={menuOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setMenuOpen(false)}
          currentPath={currentPath}
          role={user?.role}
          orgName={user?.organizationName}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={title}
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            onMenuClick={toggleSidebar}
            onLogout={logout}
          />
          <main className="w-full min-w-0 space-y-5 p-3 sm:p-5">{children}</main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
