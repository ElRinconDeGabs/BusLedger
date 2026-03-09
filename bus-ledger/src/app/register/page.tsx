"use client";

import { ui } from "@/lib/styles/ui";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      // Redirect or show success message
      console.log("User registered successfully");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={ui.wrapper}>
      <div style={ui.card}>
        <h1 style={ui.title}>Crear Cuenta</h1>
        <p style={ui.subtitle}>Regístrate para acceder</p>

        <form style={ui.form} onSubmit={handleSubmit}>
          <input
            style={ui.input}
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            style={ui.input}
            name="email"
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            style={ui.input}
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <div style={ui.errorBox}>{error}</div>}

          <button style={ui.button} type="submit">
            Crear cuenta
          </button>
        </form>

        <p style={ui.registerText}>
          ¿Ya tienes cuenta? <a style={ui.link} href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}