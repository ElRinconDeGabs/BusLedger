export function saveUserSession(user: any) {
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUserSession() {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export function logout() {
  localStorage.removeItem("user")
}

export function isAuthenticated() {
  return !!getUserSession()
}

export async function register(data: {
  name: string
  email: string
  password: string
}) {

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {

    const error = await res.json()
    throw new Error(error.error || "Error al registrar")

  }

  return res.json()

}