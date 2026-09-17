import Icon from "./Icon.jsx";

export default function Sidebar({ navItems, tab, setTab, mode, onOpenSettings }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="book" size={22} />
          <div>
            <div className="brand-title">Biblioteca</div>
            <div className="brand-title">Inteligente</div>
          </div>
        </div>
        <div className="brand-sub">Avance 1 · Panel de gestión</div>
      </div>

      <nav className="nav">
        {navItems.map((n) => (
          <div key={n.id} className={"nav-item" + (tab === n.id ? " active" : "")} onClick={() => setTab(n.id)}>
            <Icon name={n.icon} size={17} />
            <span>{n.label}</span>
            {n.count ? <span className="nav-count">{n.count}</span> : null}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="mode-pill" onClick={onOpenSettings}>
          <span className={"dot " + (mode === "live" ? "on" : "off")} />
          {mode === "live" ? "Conectado a tu API" : "Modo demostración"}
        </div>
      </div>
    </aside>
  );
}
