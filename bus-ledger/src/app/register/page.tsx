"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Link from "next/link";

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

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
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }

    if (!PASSWORD_POLICY.test(payload.password)) {
      setError("La contraseña debe tener 8 a 20 caracteres, al menos una letra y un numero, sin caracteres especiales.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo crear la cuenta");
      }

      try {
        await login({ email: payload.email, password: payload.password });
        router.replace("/dashboard");
      } catch {
        router.replace("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gray-100 px-4 py-6 text-gray-800 sm:px-6 flex items-center justify-center">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900 justify-center flex padding-bottom-4">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-slate-500 justify-center flex">
            Solo tomará unos minutos.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleSubmit} noValidate>
            <div className="relative">
              <input
                id="register-name"
                className="peer w-full rounded-xl border border-slate-200 px-3 pb-2.5 pt-5 outline-none ring-blue-100 transition placeholder:opacity-0 focus:border-blue-500 focus:ring-2 focus:placeholder:opacity-100"
                name="name"
                placeholder="Ej: Juan Perez"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              <label
                htmlFor="register-name"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-700 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Nombre completo
              </label>
            </div>

            <div className="relative">
              <input
                id="register-email"
                className="peer w-full rounded-xl border border-slate-200 px-3 pb-2.5 pt-5 outline-none ring-blue-100 transition placeholder:opacity-0 focus:border-blue-500 focus:ring-2 focus:placeholder:opacity-100"
                name="email"
                type="email"
                placeholder="Ej: usuario@correo.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <label
                htmlFor="register-email"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-700 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Correo electronico
              </label>
            </div>

            <div className="relative">
              <input
                id="register-password"
                className="peer w-full rounded-xl border border-slate-200 px-3 pb-2.5 pt-5 outline-none ring-blue-100 transition placeholder:opacity-0 focus:border-blue-500 focus:ring-2 focus:placeholder:opacity-100"
                name="password"
                type="password"
                placeholder="Ej: 8-20 caracteres con letras y numeros"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <label
                htmlFor="register-password"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-700 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Contraseña
              </label>
            </div>
            <p className="text-xs text-slate-500">Debe tener 8-20 caracteres, letras y numeros (sin caracteres especiales).</p>

            {error && <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

            <button
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Ya tienes cuenta?{" "}
            <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/login">
              Iniciar sesion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}