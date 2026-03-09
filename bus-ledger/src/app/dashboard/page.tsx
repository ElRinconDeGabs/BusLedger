"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  password: string;
}

export default function DebugUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/services/user/getById?id=1")
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <div>Cargando...</div>;

  return (
    <div style={{padding: "20px", border: "1px solid #ccc"}}>
      <h2>DEBUG USER INFO</h2>

      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Nombre:</strong> {user.name}</p>

      {/* SOLO DEBUG */}
      <p><strong>Password hash:</strong></p>
      <pre style={{
        background: "#000",
        color: "#0f0",
        padding: "10px",
        fontSize: "12px",
        overflow: "auto"
      }}>
        {user.password}
      </pre>

      <h3>Objeto completo:</h3>
      <pre>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}