export function saveUserSession(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("user");
}

export async function login(data: {
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al iniciar sesión");
  }

  const responseData = await res.json();
  
  // Guardar el userId en localStorage
  if (responseData.userId) {
    saveUserSession({ userId: responseData.userId, email: data.email });
  }

  return responseData;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al registrar");
  }

  return res.json();
}