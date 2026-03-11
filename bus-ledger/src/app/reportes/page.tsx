import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function ReportesPage() {
  return (
    <DashboardShell title="Reportes" currentPath="/reportes">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Reportes</h1>
        <p className="mt-2 text-sm text-slate-500">Seccion preparada para analitica, filtros avanzados y exportaciones.</p>
      </section>
    </DashboardShell>
  );
}
