import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserContext } from "@/lib/server/getAuth";

const MAX_LIMIT = 500;

const VALID_CATEGORIES_GASTO = ["combustible", "mantenimiento", "repuesto", "seguro", "salario", "cuota", "multa", "peaje", "lavado", "otro"];
const VALID_CATEGORIES_INGRESO = ["mensualidad", "viaje_especial", "charter", "subsidio", "otro"];

function normalizeType(raw: string): "INGRESO" | "GASTO" | null {
  const t = String(raw).toUpperCase().trim();
  if (t === "INGRESO" || t === "INCOME") return "INGRESO";
  if (t === "GASTO" || t === "EXPENSE") return "GASTO";
  return null;
}

export async function GET(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const typeParam = url.searchParams.get("type");
    const busitoParam = url.searchParams.get("busitoId");

    const rawLimit = limitParam ? Number(limitParam) : null;
    const limit =
      rawLimit && !Number.isNaN(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, MAX_LIMIT)
        : undefined;

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (fromParam) {
      const d = new Date(fromParam);
      if (!isNaN(d.getTime())) dateFilter.gte = d;
    }
    if (toParam) {
      const d = new Date(toParam);
      if (!isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        dateFilter.lte = d;
      }
    }

    const orgFilter =
      ctx.role === "ADMIN"
        ? { busito: { organizationId: ctx.organizationId } }
        : { userId: ctx.userId };

    const typeFilter = typeParam ? normalizeType(typeParam) : null;

    const where = {
      ...orgFilter,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(busitoParam ? { busitoId: Number(busitoParam) } : {}),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      ...(limit ? { take: limit } : {}),
      include: { busito: { select: { id: true, name: true } } },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json() as Record<string, unknown>;
    const { amount, description, type: rawType, busitoId, category, date: rawDate } = body;

    if (!amount || !description || !rawType || !busitoId) {
      return NextResponse.json({ error: "Datos incompletos: amount, description, type y busitoId son requeridos" }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "El monto debe ser un número mayor a cero" }, { status: 400 });
    }

    if (String(description).trim().length < 2) {
      return NextResponse.json({ error: "La descripción debe tener al menos 2 caracteres" }, { status: 400 });
    }

    const type = normalizeType(String(rawType));
    if (!type) {
      return NextResponse.json({ error: "Tipo debe ser 'INGRESO' o 'GASTO'" }, { status: 400 });
    }

    const date = rawDate ? new Date(String(rawDate)) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const busito = await prisma.busito.findFirst({
      where:
        ctx.role === "ADMIN"
          ? { id: Number(busitoId), organizationId: ctx.organizationId }
          : { id: Number(busitoId), userId: ctx.userId },
      select: { id: true },
    });
    if (!busito) return NextResponse.json({ error: "Busito no válido o sin acceso" }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        description: String(description).trim(),
        type,
        category: category ? String(category).trim() : null,
        date,
        userId: ctx.userId,
        busitoId: Number(busitoId),
      },
      include: { busito: { select: { id: true, name: true } } },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Error al crear transacción" }, { status: 500 });
  }
}
