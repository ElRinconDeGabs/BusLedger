import { NextResponse } from "next/server";

const AUTH_COOKIE = "auth_token";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout exitoso"
  });

  response.cookies.delete(AUTH_COOKIE);

  return response;
}