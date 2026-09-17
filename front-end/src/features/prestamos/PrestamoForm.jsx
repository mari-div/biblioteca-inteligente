import { useState } from "react";
import Field from "../../components/common/Field.jsx";
import { today, iso, addDays } from "../../utils/dates.js";

export default function PrestamoForm({ initial, usuarios, libros, defaultUsuario, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      idUsuario: defaultUsuario || usuarios[0]?.idUsuario,
      idLibro: libros[0]?.idLibro,
      fechaPrestamo: iso(today),
      fechaDevolucion: iso(addDays(today, 14)),
      estado: "activo",
    }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="field-row">
        <Field label="Usuario">
          <select value={form.idUsuario} onChange={(ev) => set("idUsuario", Number(ev.target.value))}>
            {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre}</option>)}
          </select>
        </Field>
        <Field label="Libro">
          <select value={form.idLibro} onChange={(ev) => set("idLibro", Number(ev.target.value))}>
            {libros.map((l) => <option key={l.idLibro} value={l.idLibro}>{l.titulo}</option>)}
          </select>
        </Field>
      </div>
      <div className="field-row">
        <Field label="Fecha de préstamo">
          <input type="date" value={form.fechaPrestamo} onChange={(ev) => set("fechaPrestamo", ev.target.value)} />
        </Field>
        <Field label="Fecha de devolución">
          <input type="date" value={form.fechaDevolucion || ""} onChange={(ev) => set("fechaDevolucion", ev.target.value)} />
        </Field>
      </div>
      <Field label="Estado">
        <select value={form.estado} onChange={(ev) => set("estado", ev.target.value)}>
          <option value="activo">Activo</option>
          <option value="devuelto">Devuelto</option>
        </select>
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSubmit(form)}>Guardar préstamo</button>
      </div>
    </>
  );
}
