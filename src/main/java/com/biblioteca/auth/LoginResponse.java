package com.biblioteca.auth;

public record LoginResponse(
        String token,
        Long idUsuario,
        String nombre,
        String email,
        String rol
) {
}
