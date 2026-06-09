"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import * as toast from "@/lib/toast";

type OrgUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  _count: { busitos: number; transactions: number };
};

type Me = { role: "ADMIN" | "USER"; id: number; organizationName: string };

const defaultForm = { name: "", email: "", password: "", role: "USER" as "ADMIN" | "USER" };

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  useEffect(() => { void bootstrap(); }, []);

  const bootstrap = async () => {
    const [meRes, usersRes] = await Promise.all([fetch("/api/me"), fetch("/api/admin/users")]);
    if (!meRes.ok) { router.push("/dashboard"); return; }
    const meData = (await meRes.json()) as Me;
    if (meData.role !== "ADMIN") { router.push("/dashboard"); return; }
    setMe(meData);
    setOrgName(meData.organizationName);
    if (usersRes.ok) setUsers((await usersRes.json()) as OrgUser[]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers((await res.json()) as OrgUser[]);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { toast.error(data.error ?? "Error al crear usuario"); return; }
      toast.success("Usuario creado");
      setForm(defaultForm);
      setShowForm(false);
      await fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (userId: number, newRole: "ADMIN" | "USER") => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { toast.error(data.error ?? "Error al cambiar rol"); return; }
    toast.success("Rol actualizado");
    await fetchUsers();
  };

  const deleteUser = async (user: OrgUser) => {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json() as { error?: string };
    if (!res.ok) { toast.error(data.error ?? "Error al eliminar"); return; }
    toast.success("Usuario eliminado");
    await fetchUsers();
  };

  const saveOrgName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    try {
      const res = await fetch("/api/admin/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { toast.error(data.error ?? "Error"); return; }
      toast.success("Nombre actualizado");
    } finally {
      setSavingOrg(false);
    }
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100";

  if (loading) {
    return (
      <DashboardShell title="Administración" currentPath="/admin">
        <div className="py-12 text-center text-sm text-muted">Cargando...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Administración" currentPath="/admin">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-border bg-surface p-4">
          <p className="text-xs text-muted">Total usuarios</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{users.length}</p>
        </div>
        <div className="rounded-[10px] border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs text-brand-700">Administradores</p>
          <p className="mt-1.5 text-2xl font-bold text-brand-700">{adminCount}</p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface p-4">
          <p className="text-xs text-muted">Usuarios</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{users.length - adminCount}</p>
        </div>
      </div>

      {/* Users */}
      <div className="rounded-[10px] border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Usuarios de la organización</h2>
            <p className="text-xs text-muted">Gestiona roles y accesos del equipo.</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-900 transition hover:opacity-90"
          >
            {showForm ? "Cancelar" : "Agregar usuario"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={createUser} className="border-b border-border bg-bg p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input placeholder="Nombre completo" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className={inputCls} />
              <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className={inputCls} />
              <input type="password" placeholder="Contraseña temporal" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required className={inputCls} />
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "USER" }))} className={inputCls}>
                <option value="USER">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-muted">La contraseña debe tener al menos 8 caracteres con letras y números.</p>
            <div className="mt-3 flex justify-end">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-900 hover:opacity-90 disabled:opacity-60">
                {saving ? "Guardando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        )}

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold text-muted">Usuario</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted">Rol</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted">Busitos</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted">Transacciones</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted">Se unió</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{u.name}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${u.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-bg text-muted"}`}>
                      {u.role === "ADMIN" ? "Admin" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{u._count.busitos}</td>
                  <td className="px-5 py-3 text-muted">{u._count.transactions}</td>
                  <td className="px-5 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString("es-PA")}</td>
                  <td className="px-5 py-3">
                    {u.id === me?.id ? (
                      <span className="text-xs text-muted">(tú)</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <button onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className="rounded border border-border px-2.5 py-1 text-xs text-muted hover:text-ink hover:border-border-2">
                          {u.role === "ADMIN" ? "→ Usuario" : "→ Admin"}
                        </button>
                        <button onClick={() => deleteUser(u)} className="rounded border border-danger-100 bg-danger-50 px-2.5 py-1 text-xs text-danger hover:bg-danger-100">
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 p-4 md:hidden">
          {users.map((u) => (
            <div key={u.id} className="rounded-lg border border-border p-3.5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium text-ink">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${u.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-bg text-muted"}`}>
                  {u.role === "ADMIN" ? "Admin" : "Usuario"}
                </span>
              </div>
              <p className="text-xs text-muted mb-2">{u._count.busitos} busitos · {u._count.transactions} transacciones</p>
              {u.id !== me?.id && (
                <div className="flex gap-2">
                  <button onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className="rounded border border-border px-2.5 py-1.5 text-xs text-muted">
                    {u.role === "ADMIN" ? "→ Usuario" : "→ Admin"}
                  </button>
                  <button onClick={() => deleteUser(u)} className="rounded border border-danger-100 bg-danger-50 px-2.5 py-1.5 text-xs text-danger">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Org name */}
      <div className="rounded-[10px] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink mb-1">Nombre de la organización</h2>
        <p className="text-xs text-muted mb-4">Se muestra en el sidebar y como identificador de la cuenta.</p>
        <form onSubmit={saveOrgName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required className={inputCls} />
          </div>
          <button type="submit" disabled={savingOrg} className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-900 hover:opacity-90 disabled:opacity-60">
            {savingOrg ? "Guardando..." : "Guardar nombre"}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
