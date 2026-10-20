package com.biblioteca.dto;

import com.biblioteca.model.Usuario;

import java.time.LocalDateTime;

/** Lo que la API devuelve de un usuario: nunca incluye la contraseña. */
public record UsuarioResponse(
        Long idUsuario,
        String nombre,
        String email,
        String rol,
        LocalDateTime fechaRegistro
) {

    public static UsuarioResponse desde(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.getFechaRegistro()
        );
    }
}
