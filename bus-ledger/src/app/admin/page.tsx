"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { ui } from "@/lib/ui";
import * as toast from "@/lib/toast";

type OrgUser = { id: number; name: string; email: string; role: "ADMIN" | "USER"; createdAt: string; _count: { busitos: number; transactions: number } };
type Me = { role: "ADMIN" | "USER"; id: number; organizationName: string };
const empty = { name: "", email: "", password: "", role: "USER" as "ADMIN" | "USER" };

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe]         = useState<Me | null>(null);
  const [users, setUsers]   = useState<OrgUser[]>([]);
  const [loading, setLoad]  = useState(true);
  const [showForm, setForm] = useState(false);
  const [form, setF]        = useState(empty);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrg]   = useState("");
  const [savOrg, setSavOrg] = useState(false);

  useEffect(() => { void boot(); }, []);

  const boot = async () => {
    const [mR, uR] = await Promise.all([fetch("/api/me"), fetch("/api/admin/users")]);
    if (!mR.ok) { router.push("/dashboard"); return; }
    const m = (await mR.json()) as Me;
    if (m.role !== "ADMIN") { router.push("/dashboard"); return; }
    setMe(m); setOrg(m.organizationName);
    if (uR.ok) setUsers((await uR.json()) as OrgUser[]);
    setLoad(false);
  };

  const reload = async () => { const r = await fetch("/api/admin/users"); if (r.ok) setUsers((await r.json()) as OrgUser[]); };

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json() as { error?: string };
      if (!r.ok) { toast.error(d.error ?? "Error"); return; }
      toast.success("Usuario creado"); setF(empty); setForm(false); await reload();
    } finally { setSaving(false); }
  };

  const changeRole = async (userId: number, role: "ADMIN" | "USER") => {
    const r = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    const d = await r.json() as { error?: string };
    if (!r.ok) { toast.error(d.error ?? "Error"); return; }
    toast.success("Rol actualizado"); await reload();
  };

  const del = async (u: OrgUser) => {
    if (!confirm(`¿Eliminar a ${u.name}?`)) return;
    const r = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const d = await r.json() as { error?: string };
    if (!r.ok) { toast.error(d.error ?? "Error"); return; }
    toast.success("Eliminado"); await reload();
  };

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault(); setSavOrg(true);
    try {
      const r = await fetch("/api/admin/organization", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: orgName }) });
      const d = await r.json() as { error?: string };
      if (!r.ok) { toast.error(d.error ?? "Error"); return; }
      toast.success("Nombre actualizado");
    } finally { setSavOrg(false); }
  };

  if (loading) return <DashboardShell title="Administración" currentPath="/admin"><div className="py-16 text-center text-sm text-muted">Cargando...</div></DashboardShell>;

  const admins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <DashboardShell title="Administración" currentPath="/admin">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${ui.card} p-4`}>
          <p className="text-xs text-muted">Total usuarios</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{users.length}</p>
        </div>
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs text-brand-700">Administradores</p>
          <p className="mt-1.5 text-2xl font-bold text-brand-600">{admins}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs text-muted">Usuarios</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{users.length - admins}</p>
        </div>
      </div>

      {/* Users */}
      <div className={ui.card}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Usuarios de la organización</h2>
            <p className="text-xs text-muted">Gestiona roles y accesos</p>
          </div>
          <button onClick={() => setForm((s) => !s)} className={ui.btn.primary}>{showForm ? "Cancelar" : "Agregar usuario"}</button>
        </div>

        {showForm && (
          <form onSubmit={create} className="border-b border-border bg-surface-2 p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div><label className={ui.label}>Nombre *</label><input placeholder="Juan Pérez" value={form.name} onChange={(e) => setF((f) => ({ ...f, name: e.target.value }))} required className={ui.input} /></div>
              <div><label className={ui.label}>Correo *</label><input type="email" placeholder="email@correo.com" value={form.email} onChange={(e) => setF((f) => ({ ...f, email: e.target.value }))} required className={ui.input} /></div>
              <div><label className={ui.label}>Contraseña *</label><input type="password" placeholder="Temporal" value={form.password} onChange={(e) => setF((f) => ({ ...f, password: e.target.value }))} required className={ui.input} /></div>
              <div><label className={ui.label}>Rol</label><select value={form.role} onChange={(e) => setF((f) => ({ ...f, role: e.target.value as "ADMIN" | "USER" }))} className={ui.select}><option value="USER">Usuario</option><option value="ADMIN">Administrador</option></select></div>
            </div>
            <p className="mt-2 text-xs text-muted">Mínimo 8 caracteres con letras y números.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(false)} className={ui.btn.secondary}>Cancelar</button>
              <button type="submit" disabled={saving} className={ui.btn.primary}>{saving ? "Guardando..." : "Crear usuario"}</button>
            </div>
          </form>
        )}

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                {["Usuario", "Rol", "Busitos", "Transacciones", "Se unió", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-5 py-3"><p className="font-medium text-ink">{u.name}</p><p className="text-xs text-muted">{u.email}</p></td>
                  <td className="px-5 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-surface-2 text-muted"}`}>
                      {u.role === "ADMIN" ? "Admin" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted">{u._count.busitos}</td>
                  <td className="px-5 py-3 text-sm text-muted">{u._count.transactions}</td>
                  <td className="px-5 py-3 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString("es-PA")}</td>
                  <td className="px-5 py-3">
                    {u.id === me?.id
                      ? <span className="text-xs text-faint">Tú</span>
                      : <div className="flex gap-1.5">
                          <button onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className={`${ui.btn.secondary} py-1 px-2.5 text-xs`}>{u.role === "ADMIN" ? "→ Usuario" : "→ Admin"}</button>
                          <button onClick={() => del(u)} className={`${ui.btn.danger} py-1 px-2.5 text-xs`}>Eliminar</button>
                        </div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-border md:hidden">
          {users.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div><p className="text-sm font-medium text-ink">{u.name}</p><p className="text-xs text-muted">{u.email}</p></div>
                <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-surface-2 text-muted"}`}>{u.role === "ADMIN" ? "Admin" : "Usuario"}</span>
              </div>
              <p className="text-xs text-muted mb-3">{u._count.busitos} busitos · {u._count.transactions} transacciones</p>
              {u.id !== me?.id && (
                <div className="flex gap-2">
                  <button onClick={() => changeRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className={`${ui.btn.secondary} py-1.5 px-2.5 text-xs`}>{u.role === "ADMIN" ? "→ Usuario" : "→ Admin"}</button>
                  <button onClick={() => del(u)} className={`${ui.btn.danger} py-1.5 px-2.5 text-xs`}>Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Org */}
      <div className={ui.card}>
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Nombre de la organización</h2>
        </div>
        <form onSubmit={saveOrg} className="flex gap-3 p-5">
          <input value={orgName} onChange={(e) => setOrg(e.target.value)} required className={`${ui.input} flex-1`} />
          <button type="submit" disabled={savOrg} className={ui.btn.primary}>{savOrg ? "Guardando..." : "Guardar"}</button>
        </form>
      </div>
    </DashboardShell>
  );
}
