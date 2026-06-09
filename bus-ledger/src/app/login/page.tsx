"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-bg px-4 py-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-brand text-base font-bold text-brand-900 mb-3">
            BL
          </div>
          <h1 className="text-2xl font-bold text-ink">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted">Accede a tu panel de control</p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2.5 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-900">
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
