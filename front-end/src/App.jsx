import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import ToastStack from "./components/common/ToastStack.jsx";
import SettingsModal from "./features/settings/SettingsModal.jsx";
import CatalogManagerModal from "./features/catalogo/CatalogManagerModal.jsx";
import LoginScreen from "./features/auth/LoginScreen.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import Catalogo from "./features/catalogo/Catalogo.jsx";
import Usuarios from "./features/usuarios/Usuarios.jsx";
import Prestamos from "./features/prestamos/Prestamos.jsx";
import Reservas from "./features/reservas/Reservas.jsx";
import Recomendaciones from "./features/recomendaciones/Recomendaciones.jsx";
import Notificaciones from "./features/notificaciones/Notificaciones.jsx";
import { useEntity } from "./hooks/useEntity.js";
import { useAuth } from "./hooks/useAuth.js";
import { readLocal, writeLocal } from "./utils/storage.js";
import { uid } from "./utils/format.js";
import { permissions } from "./utils/permissions.js";
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

  const auth = useAuth(baseUrl, mode);
  const onUnauthorized = useCallback(() => {
    auth.logout();
    pushToast("error", "Tu sesión expiró. Vuelve a iniciar sesión.");
  }, [auth, pushToast]);

  const [tab, setTab] = useState("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [catalogMgrOpen, setCatalogMgrOpen] = useState(false);

  const authArgs = [mode, baseUrl, pushToast, auth.token, onUnauthorized];
  const autores = useEntity("autores", "idAutor", seedAutores, ...authArgs);
  const generos = useEntity("generos", "idGenero", seedGeneros, ...authArgs);
  const libros = useEntity("libros", "idLibro", seedLibros, ...authArgs);
  const usuarios = useEntity("usuarios", "idUsuario", seedUsuarios, ...authArgs);
  const prestamos = useEntity("prestamos", "idPrestamo", seedPrestamos, ...authArgs);
  const reservas = useEntity("reservas", "idReserva", seedReservas, ...authArgs);
  const calificaciones = useEntity("calificaciones", "idCalificacion", seedCalificaciones, ...authArgs);
  const notificaciones = useEntity("notificaciones", "idNotificacion", seedNotificaciones, ...authArgs);
  const recomendaciones = useEntity("recomendaciones", "idRecomendacion", seedRecomendaciones, ...authArgs);

  const store = { autores, generos, libros, usuarios, prestamos, reservas, calificaciones, notificaciones, recomendaciones };

  // En modo demo, "viendo como" simula cualquier usuario de ejemplo.
  // En modo live, el "viewer" es siempre la persona realmente logueada.
  const [viewerId, setViewerId] = useState(1);
  useEffect(() => {
    if (mode === "demo" && usuarios.items.length && !usuarios.items.find((u) => u.idUsuario === viewerId)) {
      setViewerId(usuarios.items[0].idUsuario);
    }
  }, [usuarios.items, viewerId, mode]);

  const viewer = mode === "live" ? auth.user : usuarios.items.find((u) => u.idUsuario === viewerId) || usuarios.items[0] || null;
  const canManageCatalogo = permissions.gestionarCatalogo(viewer?.rol);
  const canManageUsuarios = permissions.gestionarUsuarios(viewer?.rol);
  const canManagePrestamos = permissions.gestionarPrestamos(viewer?.rol);
  const canManageReservas = permissions.gestionarReservas(viewer?.rol);

  const navItems = [
    { id: "dashboard", label: "Panel", icon: "dashboard" },
    { id: "catalogo", label: "Catálogo", icon: "book", count: libros.items.length },
    canManageUsuarios && { id: "usuarios", label: "Usuarios", icon: "users", count: usuarios.items.length },
    { id: "prestamos", label: "Préstamos", icon: "exchange", count: prestamos.items.filter((p) => p.estado === "activo").length },
    { id: "reservas", label: "Reservas", icon: "bookmark", count: reservas.items.filter((r) => r.estado !== "cancelada").length },
    { id: "recomendaciones", label: "Recomendaciones", icon: "sparkles" },
    { id: "notificaciones", label: "Notificaciones", icon: "bell", count: notificaciones.items.filter((n) => !n.leida && n.idUsuario === viewer?.idUsuario).length || undefined },
  ].filter(Boolean);

  useEffect(() => {
    if (tab === "usuarios" && !canManageUsuarios) setTab("dashboard");
  }, [tab, canManageUsuarios]);

  // Modo live sin sesión activa: mostramos la pantalla de login en vez del panel.
  if (mode === "live" && !auth.user && auth.checking) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Verificando sesión...</div>;
  }
  if (mode === "live" && !auth.user) {
    return (
      <>
        <LoginScreen
          onLogin={(email, password) => auth.login(email, password).then(() => pushToast("success", "Sesión iniciada."))}
          onRegister={(nombre, email, password) => auth.register(nombre, email, password).then(() => pushToast("success", "Cuenta creada."))}
          onBackToDemo={() => setMode("demo")}
        />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar navItems={navItems} tab={tab} setTab={setTab} mode={mode} onOpenSettings={() => setSettingsOpen(true)} />

        <div className="main">
          <Topbar
            title={TITLES[tab][0]}
            subtitle={TITLES[tab][1]}
            mode={mode}
            usuarios={usuarios.items}
            viewerId={viewerId}
            setViewerId={setViewerId}
            sessionUser={auth.user}
            onLogout={auth.logout}
            theme={theme}
            setTheme={setTheme}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <div className="content">
            {tab === "dashboard" && <Dashboard store={store} viewer={viewer} />}
            {tab === "catalogo" && (
              <Catalogo store={store} viewer={viewer} canManage={canManageCatalogo} onManage={() => setCatalogMgrOpen(true)} pushToast={pushToast} />
            )}
            {tab === "usuarios" && <Usuarios store={store} pushToast={pushToast} />}
            {tab === "prestamos" && <Prestamos store={store} viewer={viewer} canManage={canManagePrestamos} pushToast={pushToast} />}
            {tab === "reservas" && <Reservas store={store} viewer={viewer} canManage={canManageReservas} pushToast={pushToast} />}
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
