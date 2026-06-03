import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

function buildWhere(id: number, ctx: { role: string; userId: number; organizationId: number }) {
  return ctx.role === "ADMIN"
    ? { id, organizationId: ctx.organizationId }
    : { id, userId: ctx.userId };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const busito = await prisma.busito.findFirst({
      where: buildWhere(Number(id), ctx),
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 50 } },
    });

    if (!busito) return NextResponse.json({ error: "Busito no encontrado" }, { status: 404 });
    return NextResponse.json(busito);
  } catch (error) {
    console.error("Error getting busito:", error);
    return NextResponse.json({ error: "Error al obtener busito" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const exists = await prisma.busito.findFirst({ where: buildWhere(Number(id), ctx), select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Busito no encontrado" }, { status: 404 });

    const busito = await prisma.busito.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        description: body.description ?? null,
        plateNumber: body.plateNumber?.trim() ? body.plateNumber.trim() : null,
        capacity: body.capacity ? parseInt(String(body.capacity), 10) : null,
        model: body.model?.trim() ? body.model.trim() : null,
        year: body.year ? parseInt(String(body.year), 10) : null,
      },
    });

    return NextResponse.json(busito);
  } catch (error) {
    console.error("Error updating busito:", error);
    return NextResponse.json({ error: "Error al actualizar busito" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id } = await params;
    const exists = await prisma.busito.findFirst({ where: buildWhere(Number(id), ctx), select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Busito no encontrado" }, { status: 404 });

    await prisma.busito.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting busito:", error);
    return NextResponse.json({ error: "Error al eliminar busito" }, { status: 500 });
  }
}
