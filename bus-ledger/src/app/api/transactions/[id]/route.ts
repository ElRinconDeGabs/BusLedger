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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { id } = await params;

    const tx = await prisma.transaction.findFirst({
      where: { id: Number(id), userId },
      select: { id: true },
    });

    if (!tx) return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });

    await prisma.transaction.delete({ where: { id: Number(id) } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Error deleting transaction" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const tx = await prisma.transaction.findFirst({
      where: { id: Number(id), userId },
      select: { id: true },
    });

    if (!tx) return NextResponse.json({ error: "Transaccion no encontrada" }, { status: 404 });

    const updated = await prisma.transaction.update({
      where: { id: Number(id) },
      data: {
        description: body.description,
        amount: body.amount ? Number(body.amount) : undefined,
        type: body.type,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Error updating transaction" }, { status: 500 });
  }
}
