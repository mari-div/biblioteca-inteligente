import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import StarRow from "../../components/common/StarRow.jsx";
import { genreColor } from "../../utils/format.js";
import { today, iso } from "../../utils/dates.js";

export default function LibroDetailModal({ libro, store, viewer, onClose, pushToast }) {
  const { autores, generos, calificaciones, usuarios } = store;
  const autor = autores.items.find((a) => a.idAutor === libro.idAutor);
  const genero = generos.items.find((g) => g.idGenero === libro.idGenero);
  const rel = calificaciones.items.filter((c) => c.idLibro === libro.idLibro);

  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");

  const submitRating = async () => {
    if (!viewer) return;
    await calificaciones.create({ idUsuario: viewer.idUsuario, idLibro: libro.idLibro, puntuacion, comentario, fecha: iso(today) });
    setComentario("");
    pushToast("success", "Gracias por tu calificación.");
  };

  return (
    <Modal title={libro.titulo} onClose={onClose} wide>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <span className="genre-badge" style={{ background: genreColor(libro.idGenero) + "22", color: genreColor(libro.idGenero) }}>
          <span className="genre-dot" style={{ background: genreColor(libro.idGenero) }} />
          {genero?.nombre || "Sin género"}
        </span>
        <span className="isbn-tag">{libro.isbn || "sin ISBN"}</span>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "13px" }}>
        de <strong style={{ color: "var(--text)", fontWeight: 600 }}>{autor?.nombre || "Autor desconocido"}</strong>
      </p>
      <p style={{ fontSize: "13.6px", marginTop: "8px" }}>{libro.descripcion || "Sin descripción disponible."}</p>

      <div style={{ margin: "16px 0", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
        <h4 style={{ fontSize: "14px", marginBottom: "10px" }}>Calificaciones de lectores ({rel.length})</h4>
        {rel.length ? (
          rel.map((c) => {
            const u = usuarios.items.find((x) => x.idUsuario === c.idUsuario);
            return (
              <div key={c.idCalificacion} style={{ padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>{u?.nombre || "Usuario"}</span>
                  <StarRow value={c.puntuacion} onChange={() => {}} size={14} readOnly />
                </div>
                {c.comentario ? <p style={{ fontSize: "12.6px", color: "var(--muted)", marginTop: "3px" }}>{c.comentario}</p> : null}
              </div>
            );
          })
        ) : (
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>Aún nadie ha calificado este libro. Sé el primero.</p>
        )}
      </div>

      {viewer && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Calificar como {viewer.nombre}</h4>
          <StarRow value={puntuacion} onChange={setPuntuacion} />
          <textarea
            value={comentario}
            onChange={(ev) => setComentario(ev.target.value)}
            placeholder="¿Qué te pareció? (opcional)"
            style={{ width: "100%", marginTop: "10px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", borderRadius: "3px", padding: "9px", minHeight: "60px", fontFamily: "var(--font-body)" }}
          />
          <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={submitRating}>Enviar calificación</button>
        </div>
      )}
    </Modal>
  );
}
