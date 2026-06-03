import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/server/getAuth";

function isIngreso(type: string) {
  const t = type.toLowerCase();
  return t === "ingreso" || t === "income";
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const txs = await prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, type: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyMap = new Map<string, { month: string; ingresos: number; egresos: number; balance: number }>();
    let totalIngresos = 0;
    let totalEgresos = 0;

    for (const tx of txs) {
      const key = `${tx.createdAt.getFullYear()}-${String(tx.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, { month: key, ingresos: 0, egresos: 0, balance: 0 });

      const row = monthlyMap.get(key)!;
      if (isIngreso(tx.type)) {
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
