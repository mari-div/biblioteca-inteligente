import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import ToastStack from "./components/common/ToastStack.jsx";
import SettingsModal from "./features/settings/SettingsModal.jsx";
import CatalogManagerModal from "./features/catalogo/CatalogManagerModal.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import Catalogo from "./features/catalogo/Catalogo.jsx";
import Usuarios from "./features/usuarios/Usuarios.jsx";
import Prestamos from "./features/prestamos/Prestamos.jsx";
import Reservas from "./features/reservas/Reservas.jsx";
import Recomendaciones from "./features/recomendaciones/Recomendaciones.jsx";
import Notificaciones from "./features/notificaciones/Notificaciones.jsx";
import { useEntity } from "./hooks/useEntity.js";
import { readLocal, writeLocal } from "./utils/storage.js";
import { uid } from "./utils/format.js";
import {
  seedAutores, seedGeneros, seedLibros, seedUsuarios,
  seedPrestamos, seedReservas, seedCalificaciones, seedNotificaciones, seedRecomendaciones,
} from "./data/seed.js";

const TITLES = {
  dashboard: ["Panel general", "Un vistazo rápido a la actividad de la biblioteca hoy"],
  catalogo: ["Catálogo", "Explora, presta y reserva los libros disponibles"],
  usuarios: ["Usuarios", "Lectores, bibliotecarios y administradores registrados"],
  prestamos: ["Préstamos", "Registro y seguimiento de los préstamos activos"],
  reservas: ["Reservas", "Solicitudes de apartado organizadas por estado"],
  recomendaciones: ["Recomendaciones", "Sugerencias calculadas a partir de calificaciones"],
  notificaciones: ["Notificaciones", "Avisos del sistema para el usuario en sesión"],
};

export default function App() {
  const [theme, setTheme] = useState(() => readLocal("bi_theme", "dark"));
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); writeLocal("bi_theme", theme); }, [theme]);

  const [mode, setMode] = useState(() => readLocal("bi_mode", "demo"));
  const [baseUrl, setBaseUrl] = useState(() => readLocal("bi_baseurl", "/api"));
  useEffect(() => writeLocal("bi_mode", mode), [mode]);
  useEffect(() => writeLocal("bi_baseurl", baseUrl), [baseUrl]);

  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((type, msg) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const [tab, setTab] = useState("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [catalogMgrOpen, setCatalogMgrOpen] = useState(false);

  const autores = useEntity("autores", "idAutor", seedAutores, mode, baseUrl, pushToast);
  const generos = useEntity("generos", "idGenero", seedGeneros, mode, baseUrl, pushToast);
  const libros = useEntity("libros", "idLibro", seedLibros, mode, baseUrl, pushToast);
  const usuarios = useEntity("usuarios", "idUsuario", seedUsuarios, mode, baseUrl, pushToast);
  const prestamos = useEntity("prestamos", "idPrestamo", seedPrestamos, mode, baseUrl, pushToast);
  const reservas = useEntity("reservas", "idReserva", seedReservas, mode, baseUrl, pushToast);
  const calificaciones = useEntity("calificaciones", "idCalificacion", seedCalificaciones, mode, baseUrl, pushToast);
  const notificaciones = useEntity("notificaciones", "idNotificacion", seedNotificaciones, mode, baseUrl, pushToast);
  const recomendaciones = useEntity("recomendaciones", "idRecomendacion", seedRecomendaciones, mode, baseUrl, pushToast);

  const store = { autores, generos, libros, usuarios, prestamos, reservas, calificaciones, notificaciones, recomendaciones };

  const [viewerId, setViewerId] = useState(1);
  useEffect(() => {
    if (usuarios.items.length && !usuarios.items.find((u) => u.idUsuario === viewerId)) {
      setViewerId(usuarios.items[0].idUsuario);
    }
  }, [usuarios.items, viewerId]);
  const viewer = usuarios.items.find((u) => u.idUsuario === viewerId) || usuarios.items[0] || null;

  const navItems = [
    { id: "dashboard", label: "Panel", icon: "dashboard" },
    { id: "catalogo", label: "Catálogo", icon: "book", count: libros.items.length },
    { id: "usuarios", label: "Usuarios", icon: "users", count: usuarios.items.length },
    { id: "prestamos", label: "Préstamos", icon: "exchange", count: prestamos.items.filter((p) => p.estado === "activo").length },
    { id: "reservas", label: "Reservas", icon: "bookmark", count: reservas.items.filter((r) => r.estado !== "cancelada").length },
    { id: "recomendaciones", label: "Recomendaciones", icon: "sparkles" },
    { id: "notificaciones", label: "Notificaciones", icon: "bell", count: notificaciones.items.filter((n) => !n.leida && n.idUsuario === viewerId).length || undefined },
  ];

  return (
    <>
      <div className="app-shell">
        <Sidebar navItems={navItems} tab={tab} setTab={setTab} mode={mode} onOpenSettings={() => setSettingsOpen(true)} />

        <div className="main">
          <Topbar
            title={TITLES[tab][0]}
            subtitle={TITLES[tab][1]}
            usuarios={usuarios.items}
            viewerId={viewerId}
            setViewerId={setViewerId}
            theme={theme}
            setTheme={setTheme}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <div className="content">
            {tab === "dashboard" && <Dashboard store={store} viewer={viewer} />}
            {tab === "catalogo" && <Catalogo store={store} viewer={viewer} onManage={() => setCatalogMgrOpen(true)} pushToast={pushToast} />}
            {tab === "usuarios" && <Usuarios store={store} pushToast={pushToast} />}
            {tab === "prestamos" && <Prestamos store={store} viewer={viewer} pushToast={pushToast} />}
            {tab === "reservas" && <Reservas store={store} viewer={viewer} pushToast={pushToast} />}
            {tab === "recomendaciones" && <Recomendaciones store={store} viewer={viewer} pushToast={pushToast} />}
            {tab === "notificaciones" && <Notificaciones store={store} viewer={viewer} pushToast={pushToast} />}
          </div>
        </div>
      </div>

      {settingsOpen && (
        <SettingsModal mode={mode} setMode={setMode} baseUrl={baseUrl} setBaseUrl={setBaseUrl} onClose={() => setSettingsOpen(false)} pushToast={pushToast} />
      )}
      {catalogMgrOpen && <CatalogManagerModal store={store} onClose={() => setCatalogMgrOpen(false)} />}

      <ToastStack toasts={toasts} />
    </>
  );
}
