import { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Icon from "../../components/Icon.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { UsuarioForm, RoleBadge } from "./UsuarioForm.jsx";
import { initials } from "../../utils/format.js";
import { fmtDate } from "../../utils/dates.js";

export default function Usuarios({ store, pushToast }) {
  const { usuarios } = store;
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const filtered = usuarios.items.filter((u) => (u.nombre + u.email).toLowerCase().includes(q.toLowerCase()));

  const save = async (form) => {
    if (editing === "new") { await usuarios.create({ ...form, fechaRegistro: new Date().toISOString() }); pushToast("success", "Usuario creado."); }
    else { await usuarios.update(editing.idUsuario, { ...editing, ...form, password: form.password || editing.password }); pushToast("success", "Usuario actualizado."); }
    setEditing(null);
  };

  return (
    <>
      <div className="section-head">
        <div className="search">
          <Icon name="search" size={15} />
          <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Buscar por nombre o correo" />
        </div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>
          <Icon name="plus" size={15} /> Nuevo usuario
        </button>
      </div>

      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Correo</th><th>Rol</th><th>Registrado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.idUsuario}>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span className="avatar">{initials(u.nombre)}</span>
                      {u.nombre}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td><RoleBadge rol={u.rol} /></td>
                  <td>{fmtDate(u.fechaRegistro)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setEditing(u)}><Icon name="edit" size={14} /></button>
                      <button className="icon-btn" onClick={() => setConfirmDelete(u)}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card"><EmptyState title="No se encontraron usuarios" sub="Prueba con otro término de búsqueda." /></div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Nuevo usuario" : "Editar usuario"} onClose={() => setEditing(null)}>
          <UsuarioForm initial={editing === "new" ? null : editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          title="Eliminar usuario"
          onClose={() => setConfirmDelete(null)}
          footer={
            <>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={async () => { await usuarios.remove(confirmDelete.idUsuario); setConfirmDelete(null); pushToast("success", "Usuario eliminado."); }}
              >
                Eliminar
              </button>
            </>
          }
        >
          <p>{`¿Eliminar a ${confirmDelete.nombre}? Esta acción no se puede deshacer.`}</p>
        </Modal>
      )}
    </>
  );
}
