import { useState } from "react";
import Field from "../../components/common/Field.jsx";

export function UsuarioForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { nombre: "", email: "", password: "", rol: "lector" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // El backend exige entre 6 y 72 caracteres. Al editar, dejarla vacía conserva la actual.
  const pwd = form.password || "";
  const pwdCorta = pwd.length > 0 && pwd.length < 6;
  const pwdFalta = !initial && pwd.length === 0;

  return (
    <>
      <Field label="Nombre completo">
        <input value={form.nombre} onChange={(ev) => set("nombre", ev.target.value)} />
      </Field>
      <Field label="Correo">
        <input type="email" value={form.email} onChange={(ev) => set("email", ev.target.value)} />
      </Field>
      <div className="field-row">
        <Field
          label={initial ? "Nueva contraseña (opcional)" : "Contraseña"}
          hint={<span className={pwdCorta ? "hint-error" : ""}>{pwdCorta ? `Faltan ${6 - pwd.length} caracteres (mínimo 6).` : "Entre 6 y 72 caracteres."}</span>}
        >
          <input type="password" autoComplete="new-password" maxLength={72} aria-invalid={pwdCorta} value={pwd} onChange={(ev) => set("password", ev.target.value)} />
        </Field>
        <Field label="Rol">
          <select value={form.rol} onChange={(ev) => set("rol", ev.target.value)}>
            <option value="lector">Lector</option>
            <option value="bibliotecario">Bibliotecario</option>
            <option value="administrador">Administrador</option>
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={!form.nombre || !form.email || pwdCorta || pwdFalta}>
          Guardar usuario
        </button>
      </div>
    </>
  );
}

export function RoleBadge({ rol }) {
  const map = { lector: "sage", bibliotecario: "dusty", administrador: "brass" };
  const color = "var(--" + (map[rol] || "muted") + ")";
  return (
    <span className="genre-badge" style={{ background: color + "22", color }}>
      {rol}
    </span>
  );
}
