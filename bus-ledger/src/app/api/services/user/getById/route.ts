import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/server/getAuth";

export async function GET(req: NextRequest) {
  const requesterId = getUserIdFromToken(req);
  if (!requesterId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });

    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: "ID must be a valid integer" }, { status: 400 });

    // Users can only fetch their own profile
    if (userId !== requesterId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/services/user/getById ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
