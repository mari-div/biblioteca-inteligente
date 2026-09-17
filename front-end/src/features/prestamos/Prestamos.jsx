import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import PrestamoForm from "./PrestamoForm.jsx";
import { today, iso, fmtDate } from "../../utils/dates.js";

export default function Prestamos({ store, viewer, pushToast }) {
  const { prestamos, usuarios, libros } = store;
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const withComputed = prestamos.items.map((p) => ({ ...p, vencido: p.estado === "activo" && p.fechaDevolucion && p.fechaDevolucion < iso(today) }));
  const filtered = withComputed
    .filter((p) => {
      if (estadoFilter === "todos") return true;
      if (estadoFilter === "vencido") return p.vencido;
      return p.estado === estadoFilter;
    })
    .sort((a, b) => (a.fechaPrestamo < b.fechaPrestamo ? 1 : -1));

  const userName = (id) => usuarios.items.find((u) => u.idUsuario === id)?.nombre || "—";
  const bookTitle = (id) => libros.items.find((l) => l.idLibro === id)?.titulo || "—";

  const save = async (form) => {
    if (editing === "new") { await prestamos.create(form); pushToast("success", "Préstamo registrado."); }
    else { await prestamos.update(editing.idPrestamo, form); pushToast("success", "Préstamo actualizado."); }
    setEditing(null);
  };

  const marcarDevuelto = async (p) => {
    await prestamos.update(p.idPrestamo, { ...p, estado: "devuelto" });
    const libro = libros.items.find((l) => l.idLibro === p.idLibro);
    if (libro) await libros.update(libro.idLibro, { ...libro, disponible: true });
    pushToast("success", "Devolución registrada.");
  };

  return (
    <>
      <div className="section-head">
        <select className="filter" value={estadoFilter} onChange={(ev) => setEstadoFilter(ev.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="vencido">Vencidos</option>
          <option value="devuelto">Devueltos</option>
        </select>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>
          <Icon name="plus" size={15} /> Nuevo préstamo
        </button>
      </div>

      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Libro</th><th>Usuario</th><th>Prestado</th><th>Devolución</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.idPrestamo}>
                  <td>{bookTitle(p.idLibro)}</td>
                  <td>{userName(p.idUsuario)}</td>
                  <td>{fmtDate(p.fechaPrestamo)}</td>
                  <td>{fmtDate(p.fechaDevolucion)}</td>
                  <td><span className={"stamp " + (p.vencido ? "vencido" : p.estado)}>{p.vencido ? "vencido" : p.estado}</span></td>
                  <td>
                    <div className="row-actions">
                      {p.estado === "activo" && <button className="btn btn-sm" onClick={() => marcarDevuelto(p)}>Marcar devuelto</button>}
                      <button className="icon-btn" onClick={() => setEditing(p)}><Icon name="edit" size={14} /></button>
                      <button className="icon-btn" onClick={() => setConfirmDelete(p)}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card"><EmptyState title="No hay préstamos en este estado" sub="Registra uno nuevo con el botón de arriba." /></div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Nuevo préstamo" : "Editar préstamo"} onClose={() => setEditing(null)}>
          <PrestamoForm
            initial={editing === "new" ? null : editing}
            usuarios={usuarios.items}
            libros={libros.items}
            defaultUsuario={viewer?.idUsuario}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          title="Eliminar préstamo"
          onClose={() => setConfirmDelete(null)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={async () => { await prestamos.remove(confirmDelete.idPrestamo); setConfirmDelete(null); pushToast("success", "Préstamo eliminado."); }}
              >
                Eliminar
              </button>
            </>
          }
        >
          <p>¿Eliminar este registro de préstamo? Esta acción no se puede deshacer.</p>
        </Modal>
      )}
    </>
  );
}
