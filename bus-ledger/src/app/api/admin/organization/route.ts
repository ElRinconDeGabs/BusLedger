import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

export async function PATCH(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (ctx.role !== "ADMIN") return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  try {
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const org = await prisma.organization.update({
      where: { id: ctx.organizationId },
      data: { name: String(name).trim() },
      select: { id: true, name: true },
    });

    return NextResponse.json(org);
  } catch (error) {
    console.error("Error updating org:", error);
    return NextResponse.json({ error: "Error al actualizar organización" }, { status: 500 });
  }
}
