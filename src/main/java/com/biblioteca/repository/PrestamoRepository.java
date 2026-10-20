package com.biblioteca.repository;

import com.biblioteca.model.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    long countByIdUsuarioAndEstado(Long idUsuario, String estado);

    boolean existsByIdUsuarioAndIdLibroAndEstado(Long idUsuario, Long idLibro, String estado);
}