package com.biblioteca.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PrestamoRequest {

    @NotNull(message = "El usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "El libro es obligatorio")
    private Long idLibro;

    @NotNull(message = "La fecha del préstamo es obligatoria")
    private LocalDate fechaPrestamo;

    private LocalDate fechaDevolucion;

    @NotNull(message = "El estado es obligatorio")
    private String estado;

    public PrestamoRequest() {
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

    public LocalDate getFechaPrestamo() {
        return fechaPrestamo;
    }

    public void setFechaPrestamo(LocalDate fechaPrestamo) {
        this.fechaPrestamo = fechaPrestamo;
    }

    public LocalDate getFechaDevolucion() {
        return fechaDevolucion;
    }

    public void setFechaDevolucion(LocalDate fechaDevolucion) {
        this.fechaDevolucion = fechaDevolucion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}