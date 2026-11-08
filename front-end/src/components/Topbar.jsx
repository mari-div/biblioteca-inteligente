import Icon from "./Icon.jsx";
import { RoleBadge } from "../features/usuarios/UsuarioForm.jsx";

export default function Topbar({ title, subtitle, mode, usuarios, viewerId, setViewerId, sessionUser, onLogout, theme, setTheme, onOpenSettings }) {
  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      <div className="topbar-right">
        {mode === "demo" && usuarios.length > 0 && (
          <>
            <label className="topbar-label" htmlFor="viewer-select">Viendo como</label>
            <select id="viewer-select" className="viewer" value={viewerId} onChange={(ev) => setViewerId(Number(ev.target.value))}>
              {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre}</option>)}
            </select>
          </>
        )}

        {mode === "live" && sessionUser && (
          <>
            <span className="topbar-user">
              {sessionUser.nombre} <RoleBadge rol={sessionUser.rol} />
            </span>
            <button type="button" className="icon-btn" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={onLogout}>
              <Icon name="x" size={15} />
            </button>
          </>
        )}

        <button type="button" className="icon-btn" title="Cambiar tema" aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
        <button type="button" className="icon-btn" title="Conexión y datos" aria-label="Conexión y datos" onClick={onOpenSettings}>
          <Icon name="settings" size={16} />
        </button>
      </div>
    </header>
  );
}
