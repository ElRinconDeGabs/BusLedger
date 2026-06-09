import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

const VALID_STATUS = new Set(["ACTIVO", "INACTIVO", "EN_MANTENIMIENTO"]);

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
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 50,
        },
      },
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
    const body = await req.json() as Record<string, unknown>;

    const exists = await prisma.busito.findFirst({ where: buildWhere(Number(id), ctx), select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Busito no encontrado" }, { status: 404 });

    if (!body.name || String(body.name).trim().length < 1) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const rawStatus = body.status ? String(body.status).toUpperCase() : undefined;
    if (rawStatus && !VALID_STATUS.has(rawStatus)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const busito = await prisma.busito.update({
      where: { id: Number(id) },
      data: {
        name: String(body.name).trim(),
        description: body.description ? String(body.description).trim() : null,
        plateNumber: body.plateNumber ? String(body.plateNumber).trim() : null,
        capacity: body.capacity ? parseInt(String(body.capacity), 10) : null,
        model: body.model ? String(body.model).trim() : null,
        year: body.year ? parseInt(String(body.year), 10) : null,
        ...(rawStatus ? { status: rawStatus as "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO" } : {}),
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
