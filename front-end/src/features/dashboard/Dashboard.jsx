import { genreColor } from "../../utils/format.js";
import { today, iso, fmtDate, fmtRelative } from "../../utils/dates.js";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Dashboard({ store, viewer }) {
  const { libros, usuarios, prestamos, reservas, generos, notificaciones } = store;

  const esPersonal = viewer?.rol === "bibliotecario" || viewer?.rol === "administrador";
  const esAdmin = viewer?.rol === "administrador";
  const disponibles = libros.items.filter((l) => l.disponible).length;
  const activos = prestamos.items.filter((p) => p.estado === "activo").length;
  const vencidos = prestamos.items.filter((p) => p.estado === "activo" && p.fechaDevolucion < iso(today)).length;
  const solicitudes = prestamos.items.filter((p) => p.estado === "solicitado").length;
  const pendientesReserva = reservas.items.filter((r) => r.estado === "pendiente").length;

  const byGenre = generos.items.map((g) => ({ ...g, count: libros.items.filter((l) => l.idGenero === g.idGenero).length }));
  const maxCount = Math.max(1, ...byGenre.map((g) => g.count));

  const recentLoans = prestamos.items.filter((p) => p.estado === "activo" || p.estado === "devuelto").sort((a, b) => (a.fechaPrestamo < b.fechaPrestamo ? 1 : -1)).slice(0, 5);
  const dueSoon = prestamos.items
    .filter((p) => p.estado === "activo")
    .sort((a, b) => (a.fechaDevolucion > b.fechaDevolucion ? 1 : -1))
    .slice(0, 5);

  const userName = (id) => (id === viewer?.idUsuario && !esPersonal ? "Tú" : usuarios.items.find((u) => u.idUsuario === id)?.nombre || "—");
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
          <div className="stat-label">{esPersonal ? "Préstamos activos" : "Mis préstamos activos"}</div>
          <div className="stat-num">{activos}</div>
          <div className={"stat-sub" + (vencidos ? " warn" : "")}>
            {[vencidos ? `${vencidos} vencidos` : "Al día", solicitudes ? `${solicitudes} ${esPersonal ? "por aprobar" : "en espera"}` : null].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">{esPersonal ? "Reservas pendientes" : "Mis reservas pendientes"}</div>
          <div className="stat-num">{pendientesReserva}</div>
          <div className="stat-sub">{reservas.items.length} en total</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">{esAdmin ? "Usuarios registrados" : "Notificaciones sin leer"}</div>
          <div className="stat-num">{esAdmin ? usuarios.items.length : notificaciones.items.filter((n) => !n.leida).length}</div>
          <div className="stat-sub">{esAdmin ? `${notificaciones.items.filter((n) => !n.leida).length} notificaciones sin leer` : "Revisa la sección Notificaciones"}</div>
        </div>
      </div>

      <div className="card shelf-card">
        <div className="shelf-head">
          <h3>Colección por género</h3>
          <span className="shelf-hint">Pasa el cursor sobre cada lomo</span>
        </div>
        <p className="shelf-lead">La altura de cada libro representa cuántos títulos tienes de ese género.</p>
        <div className="shelf-row">
          {byGenre.map((g, i) => {
            const h = 40 + (g.count / maxCount) * 96;
            return (
              <div
                key={g.idGenero}
                className="spine"
                tabIndex={0}
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

      <div className="dash-split">
        <div className="card panel">
          <h3>Préstamos recientes</h3>
          {recentLoans.length ? (
            recentLoans.map((p) => (
              <div key={p.idPrestamo} className="list-row">
                <span>
                  <strong>{userName(p.idUsuario)}</strong> {userName(p.idUsuario) === "Tú" ? "tomaste" : "tomó"} prestado {bookTitle(p.idLibro)}
                </span>
                <span className="when">{fmtRelative(p.fechaPrestamo)}</span>
              </div>
            ))
          ) : (
            <EmptyState title="Sin préstamos todavía" sub="Cuando se registre uno, aparecerá aquí." />
          )}
        </div>

        <div className="card panel">
          <h3>Próximas devoluciones</h3>
          {dueSoon.length ? (
            dueSoon.map((p) => {
              const late = p.fechaDevolucion < iso(today);
              return (
                <div key={p.idPrestamo} className="list-row">
                  <span>{bookTitle(p.idLibro)}</span>
                  <span className={"when" + (late ? " late" : "")}>{late ? "Vencido · " : ""}{fmtDate(p.fechaDevolucion)}</span>
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
