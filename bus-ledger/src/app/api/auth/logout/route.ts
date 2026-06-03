import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/server/getAuth";

export async function POST() {
  const response = NextResponse.json({ message: "Logout exitoso" });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
