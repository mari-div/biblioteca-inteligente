package com.biblioteca.auth;

import com.biblioteca.exception.ErrorResponse;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElse(null);

        if (usuario == null || !passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            return credencialesInvalidas(httpRequest);
        }

        String token = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new LoginResponse(token, usuario.getIdUsuario(), usuario.getNombre(), usuario.getEmail(), usuario.getRol()));
    }

    /**
     * Registro público: cualquiera puede crear su propia cuenta, pero
     * siempre como "lector". Los roles de bibliotecario/administrador
     * los asigna un administrador desde el panel de usuarios
     * (PUT /api/usuarios/{id}, que ya requiere rol ADMINISTRADOR).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            ErrorResponse error = new ErrorResponse(
                    LocalDateTime.now(),
                    HttpStatus.CONFLICT.value(),
                    "Correo ya registrado",
                    "Ya existe una cuenta con ese correo.",
                    "/api/auth/register"
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol("lector");
        usuario = usuarioRepository.save(usuario);

        String token = jwtService.generarToken(usuario);
        LoginResponse body = new LoginResponse(token, usuario.getIdUsuario(), usuario.getNombre(), usuario.getEmail(), usuario.getRol());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /** Devuelve los datos del usuario dueño del token actual. Útil para que el frontend restaure la sesión al recargar la página. */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(new LoginResponse(null, usuario.getIdUsuario(), usuario.getNombre(), usuario.getEmail(), usuario.getRol()));
    }

    private ResponseEntity<ErrorResponse> credencialesInvalidas(HttpServletRequest httpRequest) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciales inválidas",
                "El correo o la contraseña son incorrectos.",
                httpRequest.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
