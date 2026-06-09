import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/server/getAuth";

const VALID_LOCALES = new Set(["es-PA", "es-DO", "es-MX", "es-CO", "es-AR", "es-ES", "en-US"]);
const VALID_CURRENCIES = new Set(["USD", "PAB", "DOP", "MXN", "COP", "ARS", "EUR"]);

export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json() as Record<string, unknown>;
    const { locale, currency } = body;

    if (locale && !VALID_LOCALES.has(String(locale))) {
      return NextResponse.json({ error: "Locale inválido" }, { status: 400 });
    }

    if (currency && !VALID_CURRENCIES.has(String(currency).toUpperCase())) {
      return NextResponse.json({ error: "Moneda inválida" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(locale ? { locale: String(locale) } : {}),
        ...(currency ? { currency: String(currency).toUpperCase() } : {}),
      },
      select: { locale: true, currency: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}
