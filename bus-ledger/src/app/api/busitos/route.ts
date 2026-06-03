import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

export async function GET(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const where =
      ctx.role === "ADMIN"
        ? { organizationId: ctx.organizationId }
        : { userId: ctx.userId };

    const busitos = await prisma.busito.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include:
        ctx.role === "ADMIN"
          ? { user: { select: { id: true, name: true } } }
          : undefined,
    });
    return NextResponse.json(busitos);
  } catch (error) {
    console.error("Error fetching busitos:", error);
    return NextResponse.json({ error: "Error al obtener busitos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { name, description, plateNumber, capacity, model, year } = await req.json();

    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const busito = await prisma.busito.create({
      data: {
        name,
        description: description ?? null,
        plateNumber: plateNumber?.trim() ? plateNumber.trim() : null,
        capacity: capacity ? parseInt(String(capacity), 10) : null,
        model: model ?? null,
        year: year ? parseInt(String(year), 10) : null,
        userId: ctx.userId,
        organizationId: ctx.organizationId,
      },
    });

    return NextResponse.json(busito, { status: 201 });
  } catch (error) {
    console.error("Error creating busito:", error);
    return NextResponse.json({ error: "Error al crear busito" }, { status: 500 });
  }
}
