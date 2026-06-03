import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserContext } from "@/lib/server/getAuth";

const VALID_TYPES = new Set(["ingreso", "gasto", "income"]);

async function findTx(id: number, ctx: { role: string; userId: number; organizationId: number }) {
  return prisma.transaction.findFirst({
    where:
      ctx.role === "ADMIN"
        ? { id, busito: { organizationId: ctx.organizationId } }
        : { id, userId: ctx.userId },
    select: { id: true },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const tx = await findTx(Number(id), ctx);
    if (!tx) return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });

    await prisma.transaction.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Error deleting transaction" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const tx = await findTx(Number(id), ctx);
    if (!tx) return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });

    if (body.type && !VALID_TYPES.has(String(body.type).toLowerCase())) {
      return NextResponse.json({ error: "Tipo debe ser 'ingreso' o 'gasto'" }, { status: 400 });
    }

    const updated = await prisma.transaction.update({
      where: { id: Number(id) },
      data: {
        description: body.description,
        amount: body.amount ? Number(body.amount) : undefined,
        type: body.type ? String(body.type).toLowerCase() : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Error updating transaction" }, { status: 500 });
  }
}
