import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserContext } from "@/lib/server/getAuth";

function normalizeType(raw: string): "INGRESO" | "GASTO" | null {
  const t = String(raw).toUpperCase().trim();
  if (t === "INGRESO" || t === "INCOME") return "INGRESO";
  if (t === "GASTO" || t === "EXPENSE") return "GASTO";
  return null;
}

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
    if (!tx) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });

    await prisma.transaction.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    const tx = await findTx(Number(id), ctx);
    if (!tx) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    if (body.description !== undefined) {
      const desc = String(body.description).trim();
      if (desc.length < 2) return NextResponse.json({ error: "La descripción debe tener al menos 2 caracteres" }, { status: 400 });
      updateData.description = desc;
    }

    if (body.amount !== undefined) {
      const amt = Number(body.amount);
      if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: "El monto debe ser mayor a cero" }, { status: 400 });
      updateData.amount = amt;
    }

    if (body.type !== undefined) {
      const type = normalizeType(String(body.type));
      if (!type) return NextResponse.json({ error: "Tipo debe ser 'INGRESO' o 'GASTO'" }, { status: 400 });
      updateData.type = type;
    }

    if (body.category !== undefined) {
      updateData.category = body.category ? String(body.category).trim() : null;
    }

    if (body.date !== undefined) {
      const date = new Date(String(body.date));
      if (isNaN(date.getTime())) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
      updateData.date = date;
    }

    const updated = await prisma.transaction.update({
      where: { id: Number(id) },
      data: updateData,
      include: { busito: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Error al actualizar transacción" }, { status: 500 });
  }
}
