import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { today, iso, fmtRelative } from "../../utils/dates.js";

const TIPO_COLOR = { prestamo: "dusty", reserva: "sage", recordatorio: "rust", sistema: "plum" };

export default function Notificaciones({ store, viewer, pushToast }) {
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
        <div style={{ color: "var(--muted)", fontSize: "13px" }}>{mine.filter((n) => !n.leida).length} sin leer de {mine.length}</div>
        <button className="btn" onClick={marcarTodas} disabled={!mine.some((n) => !n.leida)}>Marcar todas como leídas</button>
      </div>

      <div className="card" style={{ marginBottom: "18px" }}>
        {mine.length ? (
          mine.map((n) => (
            <div key={n.idNotificacion} className={"notif-item" + (n.leida ? "" : " unread")}>
              <Icon name="bell" size={15} />
              <div>
                <span className="notif-tag" style={{ background: `var(--${TIPO_COLOR[n.tipo] || "muted"})22`, color: `var(--${TIPO_COLOR[n.tipo] || "muted"})` }}>
                  {n.tipo}
                </span>
                <div className="notif-msg">{n.mensaje}</div>
                <div className="notif-time">{fmtRelative(n.fecha)}</div>
              </div>
              <button className="icon-btn notif-toggle" title={n.leida ? "Marcar como no leída" : "Marcar como leída"} onClick={() => toggle(n)}>
                <Icon name={n.leida ? "mail" : "check"} size={14} />
              </button>
            </div>
          ))
        ) : (
          <EmptyState title="Sin notificaciones" sub="Aquí verás avisos sobre préstamos, reservas y recordatorios." />
        )}
      </div>

      <div className="card" style={{ padding: "16px 18px" }}>
        <h4 style={{ fontSize: "13.5px", marginBottom: "10px" }}>Enviar notificación de prueba a {viewer?.nombre || "—"}</h4>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={mensaje}
            onChange={(ev) => setMensaje(ev.target.value)}
            placeholder="Mensaje"
            style={{ flex: 1, minWidth: "220px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", borderRadius: "3px", padding: "8px 10px" }}
          />
          <select className="filter" value={tipo} onChange={(ev) => setTipo(ev.target.value)}>
            {Object.keys(TIPO_COLOR).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-primary" onClick={enviar}>Enviar</button>
        </div>
      </div>
    </>
  );
}
