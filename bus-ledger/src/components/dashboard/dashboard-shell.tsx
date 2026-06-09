"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";
import Toaster from "@/components/ui/toaster";
import { saveDisplaySettings } from "@/lib/display-settings";

const SIDEBAR_KEY = "busledger.sidebar-collapsed";

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

type Props = { title: string; currentPath: string; children: ReactNode };

export default function DashboardShell({ title, currentPath, children }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    void loadUser();
    if (localStorage.getItem(SIDEBAR_KEY) === "true") setCollapsed(true);
  }, []);

  const loadUser = async () => {
    const res = await fetch("/api/me");
    if (!res.ok) { router.push("/login"); return; }
    const data = (await res.json()) as AppUser;
    setUser(data);
    saveDisplaySettings({ locale: data.locale, currency: data.currency });
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setCollapsed((prev) => {
        localStorage.setItem(SIDEBAR_KEY, String(!prev));
        return !prev;
      });
    } else {
      setMenuOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-[100svh] bg-bg text-ink">
      <Sidebar
        open={menuOpen}
        collapsed={collapsed}
        onClose={() => setMenuOpen(false)}
        currentPath={currentPath}
        role={user?.role}
        orgName={user?.organizationName}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          user={user}
          sidebarCollapsed={collapsed}
          onMenuClick={toggleSidebar}
          onLogout={logout}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl space-y-5">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
