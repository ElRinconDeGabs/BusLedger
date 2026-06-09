import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

const VALID_STATUS = new Set(["ACTIVO", "INACTIVO", "EN_MANTENIMIENTO"]);

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
    const body = await req.json() as Record<string, unknown>;
    const { name, description, plateNumber, capacity, model, year, status } = body;

    if (!name || String(name).trim().length < 1) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const rawStatus = status ? String(status).toUpperCase() : "ACTIVO";
    if (!VALID_STATUS.has(rawStatus)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const busito = await prisma.busito.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        plateNumber: plateNumber ? String(plateNumber).trim() : null,
        capacity: capacity ? parseInt(String(capacity), 10) : null,
        model: model ? String(model).trim() : null,
        year: year ? parseInt(String(year), 10) : null,
        status: rawStatus as "ACTIVO" | "INACTIVO" | "EN_MANTENIMIENTO",
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
