import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import ReservaForm from "./ReservaForm.jsx";
import { fmtDate } from "../../utils/dates.js";

const COLS = [
  { id: "pendiente", label: "Pendientes" },
  { id: "lista", label: "Listas para recoger" },
  { id: "cancelada", label: "Canceladas" },
];

export default function Reservas({ store, canManage, pushToast }) {
  const { reservas, usuarios, libros } = store;
  const [creating, setCreating] = useState(false);

  const userName = (id) => usuarios.items.find((u) => u.idUsuario === id)?.nombre || "—";
  const bookTitle = (id) => libros.items.find((l) => l.idLibro === id)?.titulo || "—";

  const move = async (r, estado) => { await reservas.update(r.idReserva, { ...r, estado }); pushToast("success", "Reserva actualizada."); };
  const save = async (form) => { await reservas.create(form); setCreating(false); pushToast("success", "Reserva registrada."); };

  return (
    <>
      <div className="section-head">
        <div className="section-note">
          {canManage ? "" : "Para reservar un libro prestado, ve al Catálogo."}
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={15} /> Nueva reserva
          </button>
        )}
      </div>

      <div className="board">
        {COLS.map((col) => {
          const items = reservas.items.filter((r) => r.estado === col.id);
          return (
            <div key={col.id} className="board-col">
              <h4>{col.label}<span>{items.length}</span></h4>
              {items.length ? (
                items.map((r) => (
                  <div key={r.idReserva} className="res-card">
                    <div className="titulo">{bookTitle(r.idLibro)}</div>
                    <div className="meta">{canManage ? `${userName(r.idUsuario)} · ` : ""}{fmtDate(r.fechaReserva)}</div>
                    {canManage && (
                      <div className="actions">
                        {col.id === "pendiente" && (
                          <>
                            <button className="btn btn-sm" onClick={() => move(r, "lista")}>Marcar lista</button>
                            <button className="btn btn-sm btn-danger" onClick={() => move(r, "cancelada")}>Cancelar</button>
                          </>
                        )}
                        {col.id === "lista" && (
                          <button className="btn btn-sm" onClick={() => reservas.remove(r.idReserva)}>Entregada · cerrar</button>
                        )}
                        {col.id === "cancelada" && (
                          <button className="btn btn-sm" onClick={() => move(r, "pendiente")}>Reactivar</button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="muted">Nada por aquí.</p>
              )}
            </div>
          );
        })}
      </div>

      {creating && (
        <Modal title="Nueva reserva" onClose={() => setCreating(false)}>
          <ReservaForm usuarios={usuarios.items.filter((u) => u.rol === "lector")} libros={libros.items} onSubmit={save} onCancel={() => setCreating(false)} />
        </Modal>
      )}
    </>
  );
}
