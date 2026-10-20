package com.biblioteca.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> manejarRecursoNoEncontrado(
            RecursoNoEncontradoException ex,
            HttpServletRequest request) {

        return construir(HttpStatus.NOT_FOUND, "Recurso no encontrado", ex.getMessage(), request);
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> manejarReglaNegocio(
            ReglaNegocioException ex,
            HttpServletRequest request) {

        return construir(HttpStatus.CONFLICT, "Operación no permitida", ex.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> manejarIntegridadDatos(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        return construir(
                HttpStatus.CONFLICT,
                "Conflicto de datos",
                "El registro choca con datos existentes (por ejemplo, un ISBN o email duplicado)",
                request
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> manejarJsonInvalido(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        return construir(
                HttpStatus.BAD_REQUEST,
                "Petición mal formada",
                "El cuerpo de la petición no es un JSON válido o algún campo tiene un tipo incorrecto",
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarValidaciones(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Datos inválidos");

        return construir(HttpStatus.BAD_REQUEST, "Error de validación", mensaje, request);
    }

    private ResponseEntity<ErrorResponse> construir(
            HttpStatus estado,
            String error,
            String mensaje,
            HttpServletRequest request) {

        ErrorResponse cuerpo = new ErrorResponse(
                LocalDateTime.now(),
                estado.value(),
                error,
                mensaje,
                request.getRequestURI()
        );

        return ResponseEntity.status(estado).body(cuerpo);
    }
}
