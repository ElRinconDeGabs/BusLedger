import { CSSProperties } from "react"

export const ui: Record<string, CSSProperties> = {

  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "system-ui, sans-serif"
  },

  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "40px",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    textAlign: "center",
    color: "#1e3c72"
  },

  subtitle: {
    margin: 0,
    fontSize: "14px",
    textAlign: "center",
    color: "#000000"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "10px"
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    color: "#000000"
  },

  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1e3c72",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer"
  },

  errorBox: {
    backgroundColor: "#ffe5e5",
    color: "#b00020",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center"
  },

  registerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#000000"
  },

  link: {
    color: "#1e3c72",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer"
  }

}