import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/server/getAuth";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (pw.length > 100) return "La contraseña no puede superar los 100 caracteres";
  if (!/[A-Za-z]/.test(pw)) return "La contraseña debe contener al menos una letra";
  if (!/[0-9]/.test(pw)) return "La contraseña debe contener al menos un número";
  return null;
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json() as Record<string, unknown>;
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const pwError = validatePassword(String(newPassword));
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const match = await bcrypt.compare(String(currentPassword), user.password);
    if (!match) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    if (String(currentPassword) === String(newPassword)) {
      return NextResponse.json({ error: "La nueva contraseña debe ser diferente a la actual" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
