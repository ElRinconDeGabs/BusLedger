import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/server/getAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (pw.length > 100) return "La contraseña no puede superar los 100 caracteres";
  if (!/[A-Za-z]/.test(pw)) return "La contraseña debe contener al menos una letra";
  if (!/[0-9]/.test(pw)) return "La contraseña debe contener al menos un número";
  return null;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req);
  if (limited) return limited;

  try {
    const body = await req.json() as Record<string, unknown>;
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, correo y contraseña son requeridos" }, { status: 400 });
    }

    const emailStr = String(email).toLowerCase().trim();
    if (!EMAIL_RE.test(emailStr)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    const pwError = validatePassword(String(password));
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    const nameStr = String(name).trim();
    if (nameStr.length < 2) {
      return NextResponse.json({ error: "El nombre debe tener al menos 2 caracteres" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: emailStr } });
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: `${nameStr} - Organización` },
      });
      return tx.user.create({
        data: {
          name: nameStr,
          email: emailStr,
          password: hashedPassword,
          organizationId: org.id,
          role: "ADMIN",
        },
        select: { id: true, name: true, email: true, role: true, organizationId: true },
      });
    });

    return NextResponse.json({ message: "Registro exitoso", user });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
