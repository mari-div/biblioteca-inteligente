package com.biblioteca.dto;

import jakarta.validation.constraints.NotNull;

public class ReservaRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "El libro es obligatorio")
    private Long idLibro;

    @NotNull(message = "El estado es obligatorio")
    private String estado;

    public ReservaRequest() {
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdLibro() {
        return idLibro;
    }

    public void setIdLibro(Long idLibro) {
        this.idLibro = idLibro;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}