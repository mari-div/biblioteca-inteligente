import { useState } from "react";
import Field from "../../components/common/Field.jsx";

export default function LibroForm({ initial, autores, generos, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { titulo: "", isbn: "", idAutor: autores[0]?.idAutor || "", idGenero: generos[0]?.idGenero || "", descripcion: "", disponible: true }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <Field label="Título">
        <input value={form.titulo} onChange={(ev) => set("titulo", ev.target.value)} placeholder="Título del libro" />
      </Field>
      <div className="field-row">
        <Field label="ISBN">
          <input value={form.isbn} onChange={(ev) => set("isbn", ev.target.value)} placeholder="978-..." />
        </Field>
        <Field label="Disponibilidad">
          <select value={form.disponible ? "1" : "0"} onChange={(ev) => set("disponible", ev.target.value === "1")}>
            <option value="1">Disponible</option>
            <option value="0">Prestado / no disponible</option>
          </select>
        </Field>
      </div>
      <div className="field-row">
        <Field label="Autor">
          <select value={form.idAutor} onChange={(ev) => set("idAutor", Number(ev.target.value))}>
            {autores.map((a) => (
              <option key={a.idAutor} value={a.idAutor}>{a.nombre}</option>
            ))}
          </select>
        </Field>
        <Field label="Género">
          <select value={form.idGenero} onChange={(ev) => set("idGenero", Number(ev.target.value))}>
            {generos.map((g) => (
              <option key={g.idGenero} value={g.idGenero}>{g.nombre}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Descripción">
        <textarea value={form.descripcion} onChange={(ev) => set("descripcion", ev.target.value)} placeholder="Sinopsis breve" />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={!form.titulo}>Guardar libro</button>
      </div>
    </>
  );
}
