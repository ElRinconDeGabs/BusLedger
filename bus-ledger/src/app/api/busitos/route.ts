import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const busitos = await prisma.busito.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(busitos);
  } catch (error) {
    console.error("Error fetching busitos:", error);
    return NextResponse.json({ error: "Error al obtener busitos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, plateNumber, capacity, model, year } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const busito = await prisma.busito.create({
      data: {
        name,
        description: description ?? null,
        plateNumber: plateNumber?.trim() ? plateNumber.trim() : null,
        capacity: capacity ? parseInt(String(capacity), 10) : null,
        model: model ?? null,
        year: year ? parseInt(String(year), 10) : null,
        userId,
      },
    });

    return NextResponse.json(busito, { status: 201 });
  } catch (error) {
    console.error("Error creating busito:", error);
    return NextResponse.json({ error: "Error al crear busito" }, { status: 500 });
  }
}