import Cookies from "js-cookie";

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  userId?: string;
  error?: string;
};

const TOKEN_COOKIE = "auth_token";

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = (await res.json()) as LoginResponse;

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  // El backend (route.ts) ya setea la cookie httpOnly "token".
  // No usar js-cookie para ese token.
  return data;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

export function getToken(): undefined {
  // Cookie httpOnly no es accesible desde JS.
  return undefined;
}