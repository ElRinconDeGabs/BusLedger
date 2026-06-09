import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE } from "@/lib/server/getAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (!process.env.JWT_SECRET) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        locale: true,
        currency: true,
        organization: { select: { name: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      locale: user.locale,
      currency: user.currency,
    });
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
