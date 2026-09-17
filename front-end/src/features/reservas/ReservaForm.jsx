import { useState } from "react";
import Field from "../../components/common/Field.jsx";

export default function ReservaForm({ usuarios, libros, defaultUsuario, onSubmit, onCancel }) {
  const [idUsuario, setIdUsuario] = useState(defaultUsuario || usuarios[0]?.idUsuario);
  const [idLibro, setIdLibro] = useState(libros[0]?.idLibro);

  return (
    <>
      <Field label="Usuario">
        <select value={idUsuario} onChange={(ev) => setIdUsuario(Number(ev.target.value))}>
          {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre}</option>)}
        </select>
      </Field>
      <Field label="Libro">
        <select value={idLibro} onChange={(ev) => setIdLibro(Number(ev.target.value))}>
          {libros.map((l) => <option key={l.idLibro} value={l.idLibro}>{l.titulo}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSubmit({ idUsuario, idLibro, estado: "pendiente" })}>
          Registrar reserva
        </button>
      </div>
    </>
  );
}
