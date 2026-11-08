import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { today, iso, fmtRelative } from "../../utils/dates.js";

const TIPO_COLOR = { prestamo: "dusty", reserva: "sage", recordatorio: "rust", sistema: "plum" };

export default function Notificaciones({ store, viewer, canSend, pushToast }) {
  const { notificaciones } = store;
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("sistema");

  const mine = notificaciones.items.filter((n) => n.idUsuario === viewer?.idUsuario).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const toggle = (n) => notificaciones.update(n.idNotificacion, { ...n, leida: !n.leida });
  const marcarTodas = async () => {
    for (const n of mine.filter((n) => !n.leida)) await notificaciones.update(n.idNotificacion, { ...n, leida: true });
    pushToast("success", "Notificaciones marcadas como leídas.");
  };
  const enviar = async () => {
    if (!mensaje.trim() || !viewer) return;
    await notificaciones.create({ idUsuario: viewer.idUsuario, mensaje: mensaje.trim(), tipo, fecha: iso(today), leida: false });
    setMensaje("");
    pushToast("success", "Notificación creada.");
  };

  return (
    <>
      <div className="section-head">
        <div className="section-note">{mine.filter((n) => !n.leida).length} sin leer de {mine.length}</div>
        <button className="btn" onClick={marcarTodas} disabled={!mine.some((n) => !n.leida)}>Marcar todas como leídas</button>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        {mine.length ? (
          mine.map((n) => (
            <div key={n.idNotificacion} className={"notif-item" + (n.leida ? "" : " unread")}>
              <Icon name="bell" size={15} />
              <div>
                <span className="notif-tag" style={{ "--tag": `var(--${TIPO_COLOR[n.tipo] || "muted"})` }}>
                  {n.tipo}
                </span>
                <div className="notif-msg">{n.mensaje}</div>
                <div className="notif-time">{fmtRelative(n.fecha)}</div>
              </div>
              <button type="button" className="icon-btn sm notif-toggle" title={n.leida ? "Marcar como no leída" : "Marcar como leída"} aria-label={n.leida ? "Marcar como no leída" : "Marcar como leída"} onClick={() => toggle(n)}>
                <Icon name={n.leida ? "mail" : "check"} size={14} />
              </button>
            </div>
          ))
        ) : (
          <EmptyState title="Sin notificaciones" sub="Aquí verás avisos sobre préstamos, reservas y recordatorios." />
        )}
      </div>

      {canSend && <div className="card panel">
        <h3>Enviar notificación de prueba a {viewer?.nombre || "—"}</h3>
        <div className="notif-compose">
          <input
            className="input"
            aria-label="Mensaje de la notificación"
            value={mensaje}
            onChange={(ev) => setMensaje(ev.target.value)}
            placeholder="Mensaje"
          />
          <select className="filter" aria-label="Tipo de notificación" value={tipo} onChange={(ev) => setTipo(ev.target.value)}>
            {Object.keys(TIPO_COLOR).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-primary" onClick={enviar}>Enviar</button>
        </div>
      </div>}
    </>
  );
}
