package com.biblioteca.repository;

import com.biblioteca.model.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    long countByIdUsuarioAndEstado(Long idUsuario, String estado);

    boolean existsByIdUsuarioAndIdLibroAndEstado(Long idUsuario, Long idLibro, String estado);

    /** Préstamos que vencen justo en esa fecha (para el aviso previo). */
    List<Prestamo> findByEstadoAndFechaDevolucion(String estado, LocalDate fechaDevolucion);

    /** Préstamos cuya fecha de devolución ya pasó (vencidos). */
    List<Prestamo> findByEstadoAndFechaDevolucionBefore(String estado, LocalDate fecha);
}
