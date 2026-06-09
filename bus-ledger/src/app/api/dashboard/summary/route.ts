import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

export async function GET(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const where =
      ctx.role === "ADMIN"
        ? { busito: { organizationId: ctx.organizationId } }
        : { userId: ctx.userId };

    const txs = await prisma.transaction.findMany({
      where,
      select: { amount: true, type: true, date: true },
      orderBy: { date: "asc" },
    });

    const monthlyMap = new Map<string, { month: string; ingresos: number; egresos: number; balance: number }>();
    let totalIngresos = 0;
    let totalEgresos = 0;

    for (const tx of txs) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, { month: key, ingresos: 0, egresos: 0, balance: 0 });

      const row = monthlyMap.get(key)!;
      if (tx.type === "INGRESO") {
        row.ingresos += tx.amount;
        totalIngresos += tx.amount;
      } else {
        row.egresos += tx.amount;
        totalEgresos += tx.amount;
      }
      row.balance = row.ingresos - row.egresos;
    }

    return NextResponse.json({
      totals: { ingresos: totalIngresos, egresos: totalEgresos, balance: totalIngresos - totalEgresos },
      monthly: Array.from(monthlyMap.values()),
    });
  } catch (error) {
    console.error("Error dashboard summary:", error);
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 });
  }
}
