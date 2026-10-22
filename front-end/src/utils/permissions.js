/**
 * Reglas de permisos del lado del frontend. Son solo para mostrar u
 * ocultar botones (experiencia de usuario) — la seguridad real vive en
 * el backend (Spring Security), que rechaza cualquier petición que no
 * cumpla estas mismas reglas, la haga o no la interfaz.
 */
export function isBibliotecarioOAdmin(rol) {
  return rol === "bibliotecario" || rol === "administrador";
}

export function isAdmin(rol) {
  return rol === "administrador";
}

export const permissions = {
  gestionarCatalogo: (rol) => isBibliotecarioOAdmin(rol), // crear/editar/borrar libros, autores, géneros
  gestionarUsuarios: (rol) => isAdmin(rol),                // ver y administrar la sección de usuarios
  gestionarPrestamos: (rol) => isBibliotecarioOAdmin(rol), // editar, marcar devuelto, eliminar, crear a nombre de otro
  gestionarReservas: (rol) => isBibliotecarioOAdmin(rol),  // mover de estado, eliminar, crear a nombre de otro
  verTodosLosRegistros: (rol) => isBibliotecarioOAdmin(rol), // ver préstamos, reservas y notificaciones de todos los usuarios
  enviarNotificaciones: (rol) => isBibliotecarioOAdmin(rol), // crear avisos manuales
  moderarCalificaciones: (rol) => isBibliotecarioOAdmin(rol), // eliminar calificaciones ajenas
};
