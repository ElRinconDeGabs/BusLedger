import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserContext } from "@/lib/server/getAuth";

const VALID_TYPES = new Set(["ingreso", "gasto", "income"]);
const MAX_LIMIT = 500;

export async function GET(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const rawLimit = limitParam ? Number(limitParam) : null;
    const limit =
      rawLimit && !Number.isNaN(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, MAX_LIMIT)
        : undefined;

    const where =
      ctx.role === "ADMIN"
        ? { busito: { organizationId: ctx.organizationId } }
        : { userId: ctx.userId };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
    const { amount, description, type, busitoId } = await req.json();

    if (!amount || !description || !type || !busitoId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (!VALID_TYPES.has(String(type).toLowerCase())) {
      return NextResponse.json({ error: "Tipo debe ser 'ingreso' o 'gasto'" }, { status: 400 });
    }

    const busito = await prisma.busito.findFirst({
      where:
        ctx.role === "ADMIN"
          ? { id: Number(busitoId), organizationId: ctx.organizationId }
          : { id: Number(busitoId), userId: ctx.userId },
      select: { id: true },
    });
    if (!busito) return NextResponse.json({ error: "Busito no valido" }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        description,
        type: String(type).toLowerCase(),
        userId: ctx.userId,
        busitoId: Number(busitoId),
      },
      include: { busito: { select: { id: true, name: true } } },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating transaction" }, { status: 500 });
  }
}
