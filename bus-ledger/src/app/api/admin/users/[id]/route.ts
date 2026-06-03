import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/server/getAuth";

function requireAdmin(req: NextRequest) {
  const ctx = getUserContext(req);
  if (!ctx) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }), ctx: null };
  if (ctx.role !== "ADMIN") return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }), ctx: null };
  return { error: null, ctx };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, ctx } = requireAdmin(req);
  if (error) return error;

  try {
    const { id } = await params;
    const targetId = Number(id);
    const { role } = await req.json();

    if (role !== "ADMIN" && role !== "USER") {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const target = await prisma.user.findFirst({
      where: { id: targetId, organizationId: ctx!.organizationId },
      select: { id: true, role: true },
    });
    if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Can't demote yourself if you'd be the last admin
    if (role === "USER" && target.id === ctx!.userId) {
      const adminCount = await prisma.user.count({
        where: { organizationId: ctx!.organizationId, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "No puedes quitarte el rol de admin si eres el único admin" }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Error al actualizar rol" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, ctx } = requireAdmin(req);
  if (error) return error;

  try {
    const { id } = await params;
    const targetId = Number(id);

    if (targetId === ctx!.userId) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    const target = await prisma.user.findFirst({
      where: { id: targetId, organizationId: ctx!.organizationId },
      select: { id: true, role: true, _count: { select: { busitos: true } } },
    });
    if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    if (target._count.busitos > 0) {
      return NextResponse.json(
        { error: `Este usuario tiene ${target._count.busitos} busito(s) registrado(s). Reasigna o elimina los busitos primero.` },
        { status: 400 }
      );
    }

    if (target.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { organizationId: ctx!.organizationId, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "No puedes eliminar al único admin" }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
