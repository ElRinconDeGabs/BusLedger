import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserContext } from "@/lib/server/getAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

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
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 });
    }

    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    if (!PASSWORD_POLICY.test(password)) {
      return NextResponse.json({ error: "La contraseña debe tener 8-20 caracteres, letras y numeros" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 });

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        password: await bcrypt.hash(password, 10),
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
