# Biblioteca Inteligente — Frontend

Frontend en **React 19 + Vite**, modularizado por componentes y por dominio (`dashboard`, `catalogo`, `usuarios`,
`prestamos`, `reservas`, `recomendaciones`, `notificaciones`). Consume la misma API REST que expone el backend de
Spring Boot (`Biblioteca Inteligente`).

## Estructura

```
src/
  App.jsx                 Componente raíz: layout y enrutado por pestañas
  main.jsx                Punto de entrada (monta React en el DOM)
  index.css               Tokens de diseño y estilos globales
  data/seed.js             Datos de ejemplo (modo demostración)
  utils/                   Fechas, formato, localStorage
  hooks/useEntity.js       Hook genérico de CRUD (demo o backend real)
  components/              Icon, Sidebar, Topbar y componentes de UI comunes (Modal, Field, StarRow...)
  features/
    dashboard/              Panel principal con estadísticas
    catalogo/               Libros: grid, ficha, formulario, gestor de autores/géneros
    usuarios/               Gestión de usuarios
    prestamos/               Registro de préstamos
    reservas/                Tablero de reservas
    recomendaciones/         Motor de recomendación + vista
    notificaciones/          Bandeja de notificaciones
    settings/                Modal de conexión (demo / backend real)
```

Cada entidad (`libros`, `usuarios`, `prestamos`, etc.) se maneja con el mismo hook genérico
`useEntity(name, idField, seed, mode, baseUrl, pushToast)`, que expone `{ items, create, update, remove, refresh }`
y funciona en dos modos:

- **`demo`**: los datos viven en `localStorage` del navegador (útil para presentar sin backend corriendo).
- **`live`**: hace `fetch` real a `${baseUrl}/${name}` con los verbos `GET/POST/PUT/DELETE`, exactamente como
  están definidos tus `@RestController` de Spring Boot.

## Requisitos

- Node.js 18 o superior
- Tu backend de Spring Boot corriendo en `http://localhost:8080`

## Puesta en marcha (desarrollo)

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Por defecto la app arranca en **modo demostración**. Para conectarla a tu backend:

1. Click en el ícono de engranaje ⚙️ (arriba a la derecha).
2. Cambia a "Backend real".
3. Deja la URL en `/api` (ver por qué abajo) y presiona "Probar conexión".

### Por qué no necesitas configurar CORS en desarrollo

`vite.config.js` ya incluye un proxy:

```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
  },
},
```

Esto significa que cuando el frontend pide `/api/libros`, Vite se lo reenvía a
`http://localhost:8080/api/libros` por detrás, así que el navegador nunca hace una petición
"cross-origin" real. Si tu backend corre en otro puerto, cambia el `target` aquí.

## Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` con HTML/CSS/JS ya compilados y optimizados.

### Opción A — Servir el frontend desde el propio Spring Boot (recomendado para el avance)

1. Ejecuta `npm run build`.
2. Copia **el contenido** de `dist/` (no la carpeta en sí) dentro de
   `src/main/resources/static/` de tu proyecto Spring Boot.
3. Corre `mvn spring-boot:run`. Todo queda servido en `http://localhost:8080`, frontend y API en el mismo
   origen — no necesitas `@CrossOrigin` en absoluto.
4. En el frontend ya compilado, dentro del modal de conexión, la URL `/api` funciona directo.

### Opción B — Frontend y backend como servicios separados

Sirve `dist/` con cualquier servidor estático (o `npm run preview`) y agrega `@CrossOrigin(origins = "http://tu-dominio-frontend")`
en tus `@RestController`. En el modal de conexión, pon la URL completa de tu backend
(ej. `https://tu-api.com/api`).

## El motor de recomendaciones

Vive aparte de la vista, en `src/features/recomendaciones/engine.js`, como una función pura
`computeRecommendations(viewer, store)`. Hoy corre en el navegador a partir de las calificaciones cargadas; si
más adelante quieres moverlo al backend (por ejemplo como un endpoint `GET /api/recomendaciones/usuario/{id}`),
esa función es la que tendrías que traducir a Java — la lógica ya está aislada y documentada con comentarios.
