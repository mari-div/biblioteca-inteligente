import { today, iso, addDays } from "../utils/dates.js";

export const seedAutores = [
  { idAutor: 1, nombre: "Gabriel García Márquez" },
  { idAutor: 2, nombre: "Isabel Allende" },
  { idAutor: 3, nombre: "Jorge Luis Borges" },
  { idAutor: 4, nombre: "Mario Vargas Llosa" },
  { idAutor: 5, nombre: "Ursula K. Le Guin" },
  { idAutor: 6, nombre: "Yuval Noah Harari" },
];

export const seedGeneros = [
  { idGenero: 1, nombre: "Realismo mágico" },
  { idGenero: 2, nombre: "Ciencia ficción" },
  { idGenero: 3, nombre: "Ensayo" },
  { idGenero: 4, nombre: "Cuento" },
  { idGenero: 5, nombre: "Novela histórica" },
  { idGenero: 6, nombre: "Fantasía" },
];

export const seedLibros = [
  { idLibro: 1, titulo: "Cien años de soledad", isbn: "978-0307474728", idAutor: 1, idGenero: 1, descripcion: "La saga de la familia Buendía en el pueblo de Macondo, a través de generaciones marcadas por el destino.", disponible: true },
  { idLibro: 2, titulo: "El amor en los tiempos del cólera", isbn: "978-1400034459", idAutor: 1, idGenero: 1, descripcion: "Una historia de amor que se extiende a lo largo de más de cinco décadas.", disponible: false },
  { idLibro: 3, titulo: "La casa de los espíritus", isbn: "978-8401242240", idAutor: 2, idGenero: 1, descripcion: "Cuatro generaciones de la familia Trueba narradas con un realismo mágico propio.", disponible: true },
  { idLibro: 4, titulo: "Ficciones", isbn: "978-8420633125", idAutor: 3, idGenero: 4, descripcion: "Una colección de cuentos que exploran laberintos, espejos e infinitos.", disponible: true },
  { idLibro: 5, titulo: "El Aleph", isbn: "978-8420639826", idAutor: 3, idGenero: 4, descripcion: "Relatos breves que cuestionan el tiempo, la identidad y el espacio.", disponible: true },
  { idLibro: 6, titulo: "La ciudad y los perros", isbn: "978-8420471861", idAutor: 4, idGenero: 5, descripcion: "La vida de un grupo de cadetes en un colegio militar de Lima.", disponible: false },
  { idLibro: 7, titulo: "Conversación en La Catedral", isbn: "978-8420471915", idAutor: 4, idGenero: 5, descripcion: "Un retrato de la dictadura peruana contado desde una conversación de bar.", disponible: true },
  { idLibro: 8, titulo: "Un mago de Terramar", isbn: "978-8445077893", idAutor: 5, idGenero: 6, descripcion: "El aprendizaje de un joven mago en un archipiélago gobernado por la magia del nombre verdadero.", disponible: true },
  { idLibro: 9, titulo: "La mano izquierda de la oscuridad", isbn: "978-8445001274", idAutor: 5, idGenero: 2, descripcion: "Un enviado humano intenta comprender una sociedad sin género fijo en un planeta helado.", disponible: true },
  { idLibro: 10, titulo: "Los desposeídos", isbn: "978-8445001489", idAutor: 5, idGenero: 2, descripcion: "Una reflexión sobre el anarquismo y el capitalismo a través de dos mundos gemelos.", disponible: false },
  { idLibro: 11, titulo: "Sapiens: de animales a dioses", isbn: "978-9500763870", idAutor: 6, idGenero: 3, descripcion: "Un recorrido por la historia de la humanidad desde la revolución cognitiva.", disponible: true },
  { idLibro: 12, titulo: "Homo Deus", isbn: "978-9500766363", idAutor: 6, idGenero: 3, descripcion: "Una mirada especulativa sobre el futuro de la especie humana.", disponible: true },
  { idLibro: 13, titulo: "21 lecciones para el siglo XXI", isbn: "978-9500767766", idAutor: 6, idGenero: 3, descripcion: "Un análisis de los grandes retos contemporáneos: tecnología, trabajo y política.", disponible: true },
  { idLibro: 14, titulo: "Eva Luna", isbn: "978-8401242370", idAutor: 2, idGenero: 1, descripcion: "La vida de una narradora nata que convierte su propia historia en cuentos.", disponible: true },
];

export const seedUsuarios = [
  { idUsuario: 1, nombre: "Camila Rojas", email: "camila.rojas@correo.com", password: "demo1234", rol: "lector", fechaRegistro: "2025-02-11T10:00:00" },
  { idUsuario: 2, nombre: "Diego Fernández", email: "diego.fernandez@correo.com", password: "demo1234", rol: "lector", fechaRegistro: "2025-03-04T10:00:00" },
  { idUsuario: 3, nombre: "Valentina Cruz", email: "valentina.cruz@correo.com", password: "demo1234", rol: "bibliotecario", fechaRegistro: "2024-11-20T10:00:00" },
  { idUsuario: 4, nombre: "Mateo Salazar", email: "mateo.salazar@correo.com", password: "demo1234", rol: "lector", fechaRegistro: "2025-05-02T10:00:00" },
  { idUsuario: 5, nombre: "Renata Paredes", email: "renata.paredes@correo.com", password: "demo1234", rol: "administrador", fechaRegistro: "2024-09-15T10:00:00" },
];

export const seedPrestamos = [
  { idPrestamo: 1, idUsuario: 1, idLibro: 2, fechaPrestamo: iso(addDays(today, -20)), fechaDevolucion: iso(addDays(today, -6)), estado: "activo" },
  { idPrestamo: 2, idUsuario: 2, idLibro: 6, fechaPrestamo: iso(addDays(today, -10)), fechaDevolucion: iso(addDays(today, 4)), estado: "activo" },
  { idPrestamo: 3, idUsuario: 4, idLibro: 10, fechaPrestamo: iso(addDays(today, -8)), fechaDevolucion: iso(addDays(today, 6)), estado: "activo" },
  { idPrestamo: 4, idUsuario: 1, idLibro: 1, fechaPrestamo: iso(addDays(today, -40)), fechaDevolucion: iso(addDays(today, -26)), estado: "devuelto" },
  { idPrestamo: 5, idUsuario: 3, idLibro: 11, fechaPrestamo: iso(addDays(today, -30)), fechaDevolucion: iso(addDays(today, -16)), estado: "devuelto" },
];

export const seedReservas = [
  { idReserva: 1, idUsuario: 2, idLibro: 2, fechaReserva: iso(addDays(today, -2)), estado: "pendiente" },
  { idReserva: 2, idUsuario: 4, idLibro: 6, fechaReserva: iso(addDays(today, -1)), estado: "pendiente" },
  { idReserva: 3, idUsuario: 5, idLibro: 10, fechaReserva: iso(addDays(today, -4)), estado: "lista" },
  { idReserva: 4, idUsuario: 3, idLibro: 1, fechaReserva: iso(addDays(today, -9)), estado: "cancelada" },
];

export const seedCalificaciones = [
  { idCalificacion: 1, idUsuario: 1, idLibro: 1, puntuacion: 5, comentario: "Una obra maestra, la volvería a leer.", fecha: iso(addDays(today, -25)) },
  { idCalificacion: 2, idUsuario: 3, idLibro: 1, puntuacion: 5, comentario: "Denso pero absolutamente memorable.", fecha: iso(addDays(today, -18)) },
  { idCalificacion: 3, idUsuario: 1, idLibro: 4, puntuacion: 4, comentario: "Los cuentos de Borges siempre sorprenden.", fecha: iso(addDays(today, -14)) },
  { idCalificacion: 4, idUsuario: 2, idLibro: 6, puntuacion: 4, comentario: "Dura, pero muy bien construida.", fecha: iso(addDays(today, -5)) },
  { idCalificacion: 5, idUsuario: 4, idLibro: 11, puntuacion: 5, comentario: "Cambió la forma en la que veo la historia humana.", fecha: iso(addDays(today, -11)) },
  { idCalificacion: 6, idUsuario: 5, idLibro: 9, puntuacion: 5, comentario: "Ciencia ficción con una idea central brillante.", fecha: iso(addDays(today, -7)) },
  { idCalificacion: 7, idUsuario: 3, idLibro: 12, puntuacion: 4, comentario: "Provocador, deja mucho para pensar.", fecha: iso(addDays(today, -3)) },
];

export const seedNotificaciones = [
  { idNotificacion: 1, idUsuario: 1, mensaje: "Tu préstamo de 'El amor en los tiempos del cólera' vence en 2 días.", tipo: "recordatorio", fecha: iso(addDays(today, -1)), leida: false },
  { idNotificacion: 2, idUsuario: 2, mensaje: "Tu reserva de 'El amor en los tiempos del cólera' está en cola.", tipo: "reserva", fecha: iso(addDays(today, -2)), leida: false },
  { idNotificacion: 3, idUsuario: 5, mensaje: "'Los desposeídos' ya está disponible para que lo recojas.", tipo: "reserva", fecha: iso(addDays(today, -1)), leida: true },
  { idNotificacion: 4, idUsuario: 4, mensaje: "Se registró tu préstamo de 'Los desposeídos'.", tipo: "prestamo", fecha: iso(addDays(today, -8)), leida: true },
  { idNotificacion: 5, idUsuario: 1, mensaje: "Bienvenida a Biblioteca Inteligente. Explora el catálogo y guarda tus favoritos.", tipo: "sistema", fecha: iso(addDays(today, -60)), leida: true },
];

export const seedRecomendaciones = [
  { idRecomendacion: 1, idUsuario: 1, idLibro: 3, motivo: "Basado en tu calificación alta a 'Cien años de soledad', del mismo género.", fecha: iso(addDays(today, -5)) },
];
