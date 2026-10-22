import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import BookCover from "../../components/common/BookCover.jsx";
import { seedLibros } from "../../data/seed.js";

// Antes de iniciar sesión la API no entrega libros, así que el mosaico usa el catálogo de ejemplo.
const COLUMNAS = [0, 1, 2, 3].map((c) => seedLibros.filter((_, i) => i % 4 === c));

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
    <div className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <Icon name="book" size={30} />
        </div>

        <div className="login-content">
          <span className="login-kicker">La</span>
          <h1 className="login-title">Biblioteca Inteligente</h1>
          <p className="login-tagline">Porque siempre hay un libro esperando por ti.</p>

          <div className="login-card">
            <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>{mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "18px" }}>
              {mode === "login" ? "Entra para ver tus préstamos y reservas." : "Regístrate como lector en un minuto."}
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
          </div>

          <button className="login-demo-link" onClick={onBackToDemo}>Volver al modo demostración</button>
        </div>
      </section>

      <section className="login-mosaic" aria-hidden="true">
        {COLUMNAS.map((libros, c) => (
          <div key={c} className={"mosaic-col" + (c % 2 ? " reverse" : "")} style={{ animationDuration: `${48 + c * 9}s` }}>
            {/* Cada columna se repite para llenar la altura y el bucle no tenga saltos. */}
            {[...libros, ...libros, ...libros, ...libros].map((l, i) => (
              <BookCover key={i} libro={l} size="L" className="mosaic-cover" />
            ))}
          </div>
        ))}
        <div className="mosaic-tint" />
      </section>
    </div>
  );
}
