import { useState } from "react";
import Icon from "../../components/Icon.jsx";

export default function LoginScreen({ onLogin, onRegister, onBackToDemo }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await onLogin(email, password);
      else await onRegister(nombre, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "20px" }}>
      <div className="card" style={{ width: "100%", maxWidth: "380px", padding: "28px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <Icon name="book" size={22} />
          <h2 style={{ fontSize: "19px" }}>Biblioteca Inteligente</h2>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "20px" }}>
          {mode === "login" ? "Inicia sesión para continuar." : "Crea tu cuenta de lector."}
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label>Nombre completo</label>
              <input value={nombre} onChange={(ev) => setNombre(ev.target.value)} required />
            </div>
          )}
          <div className="field">
            <label>Correo</label>
            <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} required minLength={6} />
          </div>

          {error && <p style={{ color: "var(--rust)", fontSize: "12.6px", marginBottom: "12px" }}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginBottom: "10px" }}>
            {loading ? "Un momento..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center", fontSize: "12.6px" }}
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        >
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        <div style={{ borderTop: "1px solid var(--line)", marginTop: "16px", paddingTop: "14px" }}>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "12.6px", color: "var(--muted)" }} onClick={onBackToDemo}>
            Volver al modo demostración
          </button>
        </div>
      </div>
    </div>
  );
}
