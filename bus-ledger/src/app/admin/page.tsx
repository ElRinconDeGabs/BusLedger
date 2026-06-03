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

  useEffect(() => {
    void bootstrap();
  }, []);

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
      toast.success("Usuario creado correctamente");
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
    if (!confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json() as { error?: string };
    if (!res.ok) { toast.error(data.error ?? "Error al eliminar usuario"); return; }
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
      toast.success("Nombre de organización actualizado");
    } finally {
      setSavingOrg(false);
    }
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  if (loading) {
    return (
      <DashboardShell title="Administración" currentPath="/admin">
        <div className="text-sm text-slate-500">Cargando...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Administración" currentPath="/admin">
      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total usuarios</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{users.length}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Administradores</p>
          <p className="mt-1 text-3xl font-bold text-amber-900">{adminCount}</p>
        </article>
        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Usuarios</p>
          <p className="mt-1 text-3xl font-bold text-blue-900">{userCount}</p>
        </article>
      </section>

      {/* Users table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Usuarios de la organización</h2>
            <p className="text-sm text-slate-500">Gestiona roles y accesos del equipo.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancelar" : "+ Agregar usuario"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={createUser} className="border-b border-slate-100 bg-slate-50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Nuevo usuario</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                placeholder="Nombre completo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="password"
                placeholder="Contraseña temporal"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "USER" }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="USER">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-slate-400">La contraseña debe tener 8-20 caracteres, letras y números.</p>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        )}

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Busitos</th>
                <th className="px-5 py-3">Transacciones</th>
                <th className="px-5 py-3">Se unió</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {u.role === "ADMIN" ? "Admin" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{u._count.busitos}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u._count.transactions}</td>
                  <td className="px-5 py-3.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString("es-DO")}</td>
                  <td className="px-5 py-3.5">
                    {u.id === me?.id ? (
                      <span className="text-xs text-slate-400">(tú)</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          {u.role === "ADMIN" ? "Hacer usuario" : "Hacer admin"}
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-100"
                        >
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
        <div className="space-y-3 p-4 md:hidden">
          {users.map((u) => (
            <div key={u.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  u.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {u.role === "ADMIN" ? "Admin" : "Usuario"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {u._count.busitos} busitos · {u._count.transactions} transacciones · desde {new Date(u.createdAt).toLocaleDateString("es-DO")}
              </p>
              {u.id !== me?.id && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                    className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100">
                    {u.role === "ADMIN" ? "Hacer usuario" : "Hacer admin"}
                  </button>
                  <button onClick={() => deleteUser(u)}
                    className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-100">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Org settings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Configuración de organización</h2>
        <p className="mt-1 text-sm text-slate-500">Modifica el nombre de tu organización.</p>
        <form onSubmit={saveOrgName} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Nombre</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={savingOrg}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {savingOrg ? "Guardando..." : "Guardar nombre"}
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
