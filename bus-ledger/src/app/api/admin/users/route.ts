import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserContext } from "@/lib/server/getAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (pw.length > 100) return "La contraseña no puede superar los 100 caracteres";
  if (!/[A-Za-z]/.test(pw)) return "La contraseña debe contener al menos una letra";
  if (!/[0-9]/.test(pw)) return "La contraseña debe contener al menos un número";
  return null;
}

function requireAdmin(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }), ctx: null };
  if (ctx.role !== "ADMIN") return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }), ctx: null };
  return { error: null, ctx };
}

export async function GET(req: NextRequest) {
  const { error, ctx } = requireAdmin(req);
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      where: { organizationId: ctx!.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { busitos: true, transactions: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, ctx } = requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json() as Record<string, unknown>;
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, correo y contraseña son requeridos" }, { status: 400 });
    }

    const emailStr = String(email).toLowerCase().trim();
    if (!EMAIL_RE.test(emailStr)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    const pwError = validatePassword(String(password));
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email: emailStr } });
    if (existing) return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 400 });

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: emailStr,
        password: await bcrypt.hash(String(password), 10),
        organizationId: ctx!.organizationId,
        role: role === "ADMIN" ? "ADMIN" : "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { busitos: true, transactions: true } },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
