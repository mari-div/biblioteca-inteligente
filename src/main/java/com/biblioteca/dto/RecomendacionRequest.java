package com.biblioteca.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecomendacionRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "El libro es obligatorio")
    private Long idLibro;

    @Size(max = 500, message = "El motivo no puede superar los 500 caracteres")
    private String motivo;

    public RecomendacionRequest() {
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

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}