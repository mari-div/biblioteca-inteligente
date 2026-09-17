import { useState } from "react";
import Field from "../../components/common/Field.jsx";

export function UsuarioForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { nombre: "", email: "", password: "", rol: "lector" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <Field label="Nombre completo">
        <input value={form.nombre} onChange={(ev) => set("nombre", ev.target.value)} />
      </Field>
      <Field label="Correo">
        <input type="email" value={form.email} onChange={(ev) => set("email", ev.target.value)} />
      </Field>
      <div className="field-row">
        <Field label={initial ? "Nueva contraseña (opcional)" : "Contraseña"}>
          <input type="password" value={form.password || ""} onChange={(ev) => set("password", ev.target.value)} />
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
        <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={!form.nombre || !form.email}>
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
