import Icon from "./Icon.jsx";

export default function Sidebar({ navItems, tab, setTab, mode, onOpenSettings }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="book" size={26} />
          <div>
            <div className="brand-title">Biblioteca</div>
            <div className="brand-title">Inteligente</div>
          </div>
        </div>
        <div className="brand-sub">Panel de gestión</div>
      </div>

      <nav className="nav" aria-label="Secciones">
        {navItems.map((n) => (
          <button
            key={n.id}
            type="button"
            className={"nav-item" + (tab === n.id ? " active" : "")}
            aria-current={tab === n.id ? "page" : undefined}
            onClick={() => setTab(n.id)}
          >
            <Icon name={n.icon} size={18} />
            <span>{n.label}</span>
            {n.count ? <span className="nav-count">{n.count}</span> : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button type="button" className="mode-pill" onClick={onOpenSettings}>
          <span className={"dot " + (mode === "live" ? "on" : "off")} />
          {mode === "live" ? "Conectado a tu API" : "Modo demostración"}
        </button>
      </div>
    </aside>
  );
}
