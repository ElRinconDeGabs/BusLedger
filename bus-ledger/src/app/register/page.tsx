"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError("Completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || "No se pudo crear la cuenta");
      }

      try {
        await login({ email: payload.email, password: payload.password });
        router.replace("/dashboard");
      } catch {
        router.replace("/login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-brand text-base font-bold text-brand-900 mb-3">
            BL
          </div>
          <h1 className="text-2xl font-bold text-ink">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted">Registro gratuito, sin tarjeta</p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-6">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1 text-xs text-muted">Al menos 8 caracteres con letras y números.</p>
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-900">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
