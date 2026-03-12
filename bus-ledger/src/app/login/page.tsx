"use client"

import { JSX, useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/services/authService"
import Link from "next/link"

export default function LoginPage(): JSX.Element {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault()
    setError(null)
    setLoading(true)

    try {

      const user = await login({ email, password })

      // Save user session logic should be implemented in client-compatible way
      localStorage.setItem("user", JSON.stringify(user))

      router.replace("/dashboard")

    } catch (err: any) {

      setError(err.message || "Error al iniciar sesión")

    } finally {

      setLoading(false)

    }

  }

  return (

    <main className="flex min-h-[100svh] items-center justify-center bg-gray-100 px-3 py-4 text-gray-800 sm:px-6 sm:py-6">

      <div className="w-[min(94vw,34rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

        <h1 className="flex justify-center pb-1 text-2xl font-semibold text-slate-900">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>

          <div className="relative">
            <input
              id="login-email"
              type="email"
              placeholder="Ej: usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              className="peer w-full rounded-xl border border-slate-200 px-3 pb-2.5 pt-5 outline-none ring-blue-100 transition placeholder:opacity-0 focus:border-blue-500 focus:ring-2 focus:placeholder:opacity-100"
            />
            <label
              htmlFor="login-email"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-700 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Correo electronico
            </label>
          </div>

          <div className="relative">
            <input
              id="login-password"
              type="password"
              placeholder="Ej: minimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              className="peer w-full rounded-xl border border-slate-200 px-3 pb-2.5 pt-5 outline-none ring-blue-100 transition placeholder:opacity-0 focus:border-blue-500 focus:ring-2 focus:placeholder:opacity-100"
            />
            <label
              htmlFor="login-password"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-slate-500 transition-all peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-700 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Contraseña
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800">
            Crear cuenta
          </Link>
        </p>

      </div>

    </main>

  )
}