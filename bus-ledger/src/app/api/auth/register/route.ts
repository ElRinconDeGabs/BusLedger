import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/server/getAuth";

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req);
  if (limited) return limited;

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    if (!PASSWORD_POLICY.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe tener 8 a 20 caracteres, incluir letras y numeros, sin caracteres especiales" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: `${String(name).trim()} - Organización` },
      });
      return tx.user.create({
        data: {
          name: String(name).trim(),
          email: String(email).toLowerCase().trim(),
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
