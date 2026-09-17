import { useState, useEffect } from "react";
import Icon from "../../components/Icon.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { computeRecommendations } from "./engine.js";
import { genreColor } from "../../utils/format.js";
import { today, iso, fmtDate } from "../../utils/dates.js";

export default function Recomendaciones({ store, viewer, pushToast }) {
  const { autores, generos, recomendaciones, libros, calificaciones } = store;
  const [computed, setComputed] = useState(() => computeRecommendations(viewer, store));

  useEffect(() => {
    setComputed(computeRecommendations(viewer, store));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.idUsuario, libros.items.length, calificaciones.items.length]);

  const guardar = async (item) => {
    await recomendaciones.create({ idUsuario: viewer.idUsuario, idLibro: item.libro.idLibro, motivo: item.motivo, fecha: iso(today) });
    pushToast("success", "Recomendación guardada.");
  };

  const savedForViewer = recomendaciones.items.filter((r) => r.idUsuario === viewer?.idUsuario);

  return (
    <>
      <div className="card rec-hero">
        <div className="rec-hero-text">
          <h3>{viewer ? `Sugerencias para ${viewer.nombre}` : "Sugerencias"}</h3>
          <p>
            Calculadas al momento a partir de tus calificaciones: se prioriza el género que más te ha gustado y, si no
            hay suficientes datos, se completa con los libros mejor valorados por la comunidad.
          </p>
        </div>
        <Icon name="sparkles" size={34} />
      </div>

      {computed.length ? (
        <div className="rec-grid">
          {computed.map((item) => {
            const autor = autores.items.find((a) => a.idAutor === item.libro.idAutor);
            const genero = generos.items.find((g) => g.idGenero === item.libro.idGenero);
            const yaGuardada = savedForViewer.some((r) => r.idLibro === item.libro.idLibro);
            return (
              <div key={item.libro.idLibro} className="card rec-card">
                {genero && (
                  <span className="genre-badge" style={{ background: genreColor(item.libro.idGenero) + "22", color: genreColor(item.libro.idGenero) }}>
                    <span className="genre-dot" style={{ background: genreColor(item.libro.idGenero) }} />
                    {genero.nombre}
                  </span>
                )}
                <div className="book-title">{item.libro.titulo}</div>
                <div className="book-author">{autor?.nombre || "Autor desconocido"}</div>
                <div className="rec-why">{item.motivo}</div>
                <button className={"btn btn-sm" + (yaGuardada ? "" : " btn-primary")} disabled={yaGuardada} onClick={() => guardar(item)}>
                  {yaGuardada ? "Ya guardada" : "Guardar recomendación"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState title="Aún no hay suficientes datos" sub="Califica algunos libros desde el catálogo para recibir sugerencias personalizadas." />
        </div>
      )}

      {savedForViewer.length > 0 && (
        <div style={{ marginTop: "26px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Recomendaciones guardadas</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Libro</th><th>Motivo</th><th>Fecha</th><th></th></tr></thead>
              <tbody>
                {savedForViewer.map((r) => {
                  const libro = libros.items.find((l) => l.idLibro === r.idLibro);
                  return (
                    <tr key={r.idRecomendacion}>
                      <td>{libro?.titulo || "—"}</td>
                      <td>{r.motivo}</td>
                      <td>{fmtDate(r.fecha)}</td>
                      <td><button className="icon-btn" onClick={() => recomendaciones.remove(r.idRecomendacion)}><Icon name="trash" size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
