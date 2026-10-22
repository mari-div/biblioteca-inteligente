package com.biblioteca.repository;

import com.biblioteca.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    /** Evita avisar dos veces lo mismo al mismo usuario el mismo día. */
    boolean existsByIdUsuarioAndTipoAndMensajeAndFechaAfter(
            Long idUsuario, String tipo, String mensaje, LocalDateTime desde);
}
