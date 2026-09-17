import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import AvgStars from "../../components/common/AvgStars.jsx";
import LibroForm from "./LibroForm.jsx";
import LibroDetailModal from "./LibroDetailModal.jsx";
import { genreColor } from "../../utils/format.js";
import { today, iso, addDays } from "../../utils/dates.js";

export default function Catalogo({ store, viewer, onManage, pushToast }) {
  const { libros, autores, generos, prestamos, reservas, calificaciones } = store;
  const [q, setQ] = useState("");
  const [genFilter, setGenFilter] = useState("todos");
  const [availFilter, setAvailFilter] = useState("todos");
  const [editing, setEditing] = useState(null); // libro | "new" | null
  const [detail, setDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = libros.items.filter((l) => {
    if (genFilter !== "todos" && l.idGenero !== Number(genFilter)) return false;
    if (availFilter === "disp" && !l.disponible) return false;
    if (availFilter === "prest" && l.disponible) return false;
    if (q) {
      const autorNombre = autores.items.find((a) => a.idAutor === l.idAutor)?.nombre || "";
      if (!l.titulo.toLowerCase().includes(q.toLowerCase()) && !autorNombre.toLowerCase().includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const saveLibro = async (form) => {
    if (editing === "new") { await libros.create(form); pushToast("success", "Libro agregado al catálogo."); }
    else { await libros.update(editing.idLibro, form); pushToast("success", "Libro actualizado."); }
    setEditing(null);
  };

  const quickPrestar = async (libro) => {
    if (!viewer) return;
    await prestamos.create({ idUsuario: viewer.idUsuario, idLibro: libro.idLibro, fechaPrestamo: iso(today), fechaDevolucion: iso(addDays(today, 14)), estado: "activo" });
    await libros.update(libro.idLibro, { ...libro, disponible: false });
    pushToast("success", `Préstamo registrado para ${viewer.nombre}.`);
  };
  const quickReservar = async (libro) => {
    if (!viewer) return;
    await reservas.create({ idUsuario: viewer.idUsuario, idLibro: libro.idLibro, estado: "pendiente" });
    pushToast("success", `Reserva registrada para ${viewer.nombre}.`);
  };

  return (
    <>
      <div className="section-head">
        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={15} />
            <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Buscar por título o autor" />
          </div>
          <select className="filter" value={genFilter} onChange={(ev) => setGenFilter(ev.target.value)}>
            <option value="todos">Todos los géneros</option>
            {generos.items.map((g) => (
              <option key={g.idGenero} value={g.idGenero}>{g.nombre}</option>
            ))}
          </select>
          <select className="filter" value={availFilter} onChange={(ev) => setAvailFilter(ev.target.value)}>
            <option value="todos">Disponibilidad</option>
            <option value="disp">Disponibles</option>
            <option value="prest">Prestados</option>
          </select>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={onManage}>Autores y géneros</button>
          <button className="btn btn-primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={15} /> Nuevo libro
          </button>
        </div>
      </div>

      {filtered.length ? (
        <div className="book-grid">
          {filtered.map((l) => {
            const autor = autores.items.find((a) => a.idAutor === l.idAutor);
            const genero = generos.items.find((g) => g.idGenero === l.idGenero);
            return (
              <div key={l.idLibro} className="card book-card">
                <div className="book-top">
                  <div>
                    <div className="book-title">{l.titulo}</div>
                    <div className="book-author">{autor?.nombre || "Autor desconocido"}</div>
                  </div>
                  <span className="isbn-tag">{l.isbn || "s/isbn"}</span>
                </div>
                {genero && (
                  <span className="genre-badge" style={{ background: genreColor(l.idGenero) + "22", color: genreColor(l.idGenero) }}>
                    <span className="genre-dot" style={{ background: genreColor(l.idGenero) }} />
                    {genero.nombre}
                  </span>
                )}
                <div className="book-desc">{l.descripcion || "Sin descripción."}</div>
                <div className="book-meta">
                  <span className="avail">
                    <span className={"dot " + (l.disponible ? "on" : "off")} />
                    {l.disponible ? "Disponible" : "Prestado"}
                  </span>
                  <AvgStars items={calificaciones.items} idLibro={l.idLibro} />
                </div>
                <div className="book-actions">
                  <button className="btn btn-sm" onClick={() => setDetail(l)}>Ver ficha</button>
                  {l.disponible ? (
                    <button className="btn btn-sm btn-primary" onClick={() => quickPrestar(l)}>Prestar</button>
                  ) : (
                    <button className="btn btn-sm" onClick={() => quickReservar(l)}>Reservar</button>
                  )}
                  <button className="icon-btn" title="Editar" onClick={() => setEditing(l)}>
                    <Icon name="edit" size={14} />
                  </button>
                  <button className="icon-btn" title="Eliminar" onClick={() => setConfirmDelete(l)}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState title="No hay libros que coincidan" sub="Ajusta la búsqueda o los filtros, o agrega un nuevo libro al catálogo." />
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Nuevo libro" : "Editar libro"} onClose={() => setEditing(null)}>
          <LibroForm
            initial={editing === "new" ? null : editing}
            autores={autores.items}
            generos={generos.items}
            onSubmit={saveLibro}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {detail && <LibroDetailModal libro={detail} store={store} viewer={viewer} onClose={() => setDetail(null)} pushToast={pushToast} />}

      {confirmDelete && (
        <Modal
          title="Eliminar libro"
          onClose={() => setConfirmDelete(null)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={async () => { await libros.remove(confirmDelete.idLibro); setConfirmDelete(null); pushToast("success", "Libro eliminado."); }}
              >
                Eliminar
              </button>
            </>
          }
        >
          <p>{`¿Eliminar "${confirmDelete.titulo}" del catálogo? Esta acción no se puede deshacer.`}</p>
        </Modal>
      )}
    </>
  );
}
