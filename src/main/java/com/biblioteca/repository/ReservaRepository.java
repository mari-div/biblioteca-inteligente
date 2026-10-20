package com.biblioteca.repository;

import com.biblioteca.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    Optional<Reserva> findFirstByIdLibroAndEstadoOrderByFechaReservaAsc(Long idLibro, String estado);

    boolean existsByIdUsuarioAndIdLibroAndEstadoIn(Long idUsuario, Long idLibro, Collection<String> estados);

    long countByIdLibroAndEstado(Long idLibro, String estado);
}
