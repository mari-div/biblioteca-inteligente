import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import StarRow from "../../components/common/StarRow.jsx";
import BookCover from "../../components/common/BookCover.jsx";
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
      <div className="book-detail-head">
        <BookCover libro={libro} autor={autor?.nombre} size="L" className="book-cover-lg" />
        <div>
          <div className="detail-tags">
            <span className="genre-badge" style={{ background: genreColor(libro.idGenero) + "22" }}>
              <span className="genre-dot" style={{ background: genreColor(libro.idGenero) }} />
              {genero?.nombre || "Sin género"}
            </span>
            <span className="isbn-tag">{libro.isbn || "sin ISBN"}</span>
          </div>
          <p className="detail-author">
            de <strong>{autor?.nombre || "Autor desconocido"}</strong>
          </p>
          <p className="detail-desc">{libro.descripcion || "Sin descripción disponible."}</p>
        </div>
      </div>

      <div className="detail-section">
        <h4>Calificaciones de lectores ({rel.length})</h4>
        {rel.length ? (
          rel.map((c) => {
            const u = usuarios.items.find((x) => x.idUsuario === c.idUsuario);
            return (
              <div key={c.idCalificacion} className="review">
                <div className="review-head">
                  <span className="review-name">{c.idUsuario === viewer?.idUsuario ? "Tú" : u?.nombre || "Lector"}</span>
                  <StarRow value={c.puntuacion} onChange={() => {}} size={14} readOnly />
                </div>
                {c.comentario ? <p className="review-text">{c.comentario}</p> : null}
              </div>
            );
          })
        ) : (
          <p className="muted">Aún nadie ha calificado este libro. Sé el primero.</p>
        )}
      </div>

      {viewer && (
        <div className="detail-section">
          <h4>Calificar como {viewer.nombre}</h4>
          <StarRow value={puntuacion} onChange={setPuntuacion} />
          <textarea
            aria-label="Tu comentario"
            value={comentario}
            onChange={(ev) => setComentario(ev.target.value)}
            placeholder="¿Qué te pareció? (opcional)"
            style={{ marginTop: "12px" }}
          />
          <button className="btn btn-primary" style={{ marginTop: "12px" }} onClick={submitRating}>Enviar calificación</button>
        </div>
      )}
    </Modal>
  );
}
