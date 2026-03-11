import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const AUTH_COOKIE = "auth_token";

function getUserIdFromToken(req: NextRequest): number | null {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token || !process.env.JWT_SECRET) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : null;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      ...(limit && !Number.isNaN(limit) ? { take: limit } : {}),
      include: {
        busito: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, description, type, busitoId } = body;

    if (!amount || !description || !type || !busitoId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const existingBusito = await prisma.busito.findFirst({
      where: { id: Number(busitoId), userId },
      select: { id: true },
    });
    if (!existingBusito) {
      return NextResponse.json({ error: "Busito no valido" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        description,
        type,
        userId,
        busitoId: Number(busitoId),
      },
      include: {
        busito: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating transaction" },
      { status: 500 }
    );
  }
}