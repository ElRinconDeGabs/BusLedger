"use client"

import { JSX, useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/services/authService"
import { ui } from "@/lib/styles/ui"

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

    <div style={ui.wrapper}>

      <div style={ui.card}>

        <h1 style={ui.title}>
          Iniciar Sesión
        </h1>

        <p style={ui.subtitle}>
          Accede a tu cuenta
        </p>

        <form onSubmit={handleSubmit} style={ui.form}>

          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={ui.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={ui.input}
          />

          {error && (
            <div style={ui.errorBox}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...ui.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <p style={ui.registerText}>
          ¿No tienes cuenta?{" "}
          <a href="/register" style={ui.link}>
            Crear cuenta
          </a>
        </p>

      </div>

    </div>

  )
}