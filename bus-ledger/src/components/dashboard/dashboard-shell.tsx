"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";

const SIDEBAR_COLLAPSED_KEY = "busledger.sidebar-collapsed";

type User = {
  id: number;
  name: string;
  email: string;
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void fetchUser();
    const savedState = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (savedState === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  const fetchUser = async () => {
    const res = await fetch("/api/me");
    if (!res.ok) {
      router.push("/login");
      return;
    }

    const data = (await res.json()) as User;
    setUser(data);
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
    <div className="min-h-[100svh] overflow-x-hidden bg-gray-100 text-gray-800">
      <div className="flex min-h-[100svh] w-full items-stretch">
        <Sidebar
          open={menuOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setMenuOpen(false)}
          currentPath={currentPath}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={title}
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            onMenuClick={toggleSidebar}
            onLogout={logout}
          />
          <main className="w-full min-w-0 space-y-6 p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
