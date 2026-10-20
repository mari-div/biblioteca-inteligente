package com.biblioteca.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

/**
 * Convierte los ResponseStatusException (400, 401, 409 de usuarios y login)
 * al mismo formato ErrorResponse que usa GlobalExceptionHandler.
 */
@RestControllerAdvice
public class ErroresHttpHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> manejarResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request) {

        HttpStatus estado = HttpStatus.valueOf(ex.getStatusCode().value());

        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                estado.value(),
                estado.getReasonPhrase(),
                ex.getReason(),
                request.getRequestURI()
        );

        return ResponseEntity.status(estado).body(error);
    }
}
