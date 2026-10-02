import Icon from "./Icon.jsx";
import { RoleBadge } from "../features/usuarios/UsuarioForm.jsx";

export default function Topbar({ title, subtitle, mode, usuarios, viewerId, setViewerId, sessionUser, onLogout, theme, setTheme, onOpenSettings }) {
  return (
    <div className="topbar">
      <div>
        <h2>{title}</h2>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      <div className="topbar-right">
        {mode === "demo" && usuarios.length > 0 && (
          <>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Viendo como</span>
            <select className="viewer" value={viewerId} onChange={(ev) => setViewerId(Number(ev.target.value))}>
              {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre}</option>)}
            </select>
          </>
        )}

        {mode === "live" && sessionUser && (
          <>
            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              {sessionUser.nombre} <RoleBadge rol={sessionUser.rol} />
            </span>
            <button className="icon-btn" title="Cerrar sesión" onClick={onLogout}>
              <Icon name="x" size={15} />
            </button>
          </>
        )}

        <button className="icon-btn" title="Cambiar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
        <button className="icon-btn" title="Conexión y datos" onClick={onOpenSettings}>
          <Icon name="settings" size={16} />
        </button>
      </div>
    </div>
  );
}
