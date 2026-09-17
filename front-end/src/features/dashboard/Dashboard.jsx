import { genreColor } from "../../utils/format.js";
import { today, iso, fmtDate, fmtRelative } from "../../utils/dates.js";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Dashboard({ store }) {
  const { libros, usuarios, prestamos, reservas, generos, notificaciones } = store;

  const disponibles = libros.items.filter((l) => l.disponible).length;
  const activos = prestamos.items.filter((p) => p.estado === "activo").length;
  const vencidos = prestamos.items.filter((p) => p.estado === "activo" && p.fechaDevolucion < iso(today)).length;
  const pendientesReserva = reservas.items.filter((r) => r.estado === "pendiente").length;

  const byGenre = generos.items.map((g) => ({ ...g, count: libros.items.filter((l) => l.idGenero === g.idGenero).length }));
  const maxCount = Math.max(1, ...byGenre.map((g) => g.count));

  const recentLoans = [...prestamos.items].sort((a, b) => (a.fechaPrestamo < b.fechaPrestamo ? 1 : -1)).slice(0, 5);
  const dueSoon = prestamos.items
    .filter((p) => p.estado === "activo")
    .sort((a, b) => (a.fechaDevolucion > b.fechaDevolucion ? 1 : -1))
    .slice(0, 5);

  const userName = (id) => usuarios.items.find((u) => u.idUsuario === id)?.nombre || "—";
  const bookTitle = (id) => libros.items.find((l) => l.idLibro === id)?.titulo || "—";

  return (
    <>
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Libros en catálogo</div>
          <div className="stat-num">{libros.items.length}</div>
          <div className="stat-sub">{disponibles} disponibles hoy</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Préstamos activos</div>
          <div className="stat-num">{activos}</div>
          <div className="stat-sub" style={vencidos ? { color: "var(--rust)" } : undefined}>
            {vencidos ? `${vencidos} vencidos` : "Al día"}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Reservas pendientes</div>
          <div className="stat-num">{pendientesReserva}</div>
          <div className="stat-sub">{reservas.items.length} en total</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Usuarios registrados</div>
          <div className="stat-num">{usuarios.items.length}</div>
          <div className="stat-sub">{notificaciones.items.filter((n) => !n.leida).length} notificaciones sin leer</div>
        </div>
      </div>

      <div className="card shelf-card">
        <div className="shelf-head">
          <h3>Colección por género</h3>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>Pasa el cursor sobre cada lomo</span>
        </div>
        <p>La altura de cada libro representa cuántos títulos tienes de ese género.</p>
        <div className="shelf-row">
          {byGenre.map((g, i) => {
            const h = 40 + (g.count / maxCount) * 96;
            return (
              <div
                key={g.idGenero}
                className="spine"
                style={{ width: 30 + (i % 3) * 6, height: h, background: genreColor(g.idGenero), animationDelay: i * 0.06 + "s" }}
              >
                <span className="tip">{g.nombre} · {g.count}</span>
              </div>
            );
          })}
        </div>
        <div className="shelf-ledge" />
        <div className="shelf-ledge-shadow" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
        <div className="card" style={{ padding: "16px 18px" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>Préstamos recientes</h3>
          {recentLoans.length ? (
            recentLoans.map((p) => (
              <div key={p.idPrestamo} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)", fontSize: "13px" }}>
                <span>
                  <strong style={{ fontWeight: 600 }}>{userName(p.idUsuario)}</strong> tomó prestado {bookTitle(p.idLibro)}
                </span>
                <span style={{ color: "var(--muted)" }}>{fmtRelative(p.fechaPrestamo)}</span>
              </div>
            ))
          ) : (
            <EmptyState title="Sin préstamos todavía" sub="Cuando se registre uno, aparecerá aquí." />
          )}
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>Próximas devoluciones</h3>
          {dueSoon.length ? (
            dueSoon.map((p) => {
              const late = p.fechaDevolucion < iso(today);
              return (
                <div key={p.idPrestamo} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)", fontSize: "13px" }}>
                  <span>{bookTitle(p.idLibro)}</span>
                  <span style={{ color: late ? "var(--rust)" : "var(--muted)" }}>{fmtDate(p.fechaDevolucion)}</span>
                </div>
              );
            })
          ) : (
            <EmptyState title="No hay devoluciones próximas" sub="Todo tranquilo por ahora." />
          )}
        </div>
      </div>
    </>
  );
}
