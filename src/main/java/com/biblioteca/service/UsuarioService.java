package com.biblioteca.service;

import com.biblioteca.dto.UsuarioRequest;
import com.biblioteca.dto.UsuarioResponse;
import com.biblioteca.exception.RecursoNoEncontradoException;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::desde)
                .toList();
    }

    public UsuarioResponse buscarPorId(Long id) {
        return UsuarioResponse.desde(obtener(id));
    }

    public UsuarioResponse crear(UsuarioRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria");
        }

        String email = normalizarEmail(request.getEmail());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con el email " + email);
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(email);
        usuario.setRol(request.getRol());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));

        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    public UsuarioResponse actualizar(Long id, UsuarioRequest request) {
        Usuario usuario = obtener(id);

        String email = normalizarEmail(request.getEmail());
        if (usuarioRepository.existsByEmailAndIdUsuarioNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe otro usuario con el email " + email);
        }

        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(email);
        usuario.setRol(request.getRol());

        // Contraseña vacía al editar = se mantiene la que ya tenía
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    public void eliminar(Long id) {
        usuarioRepository.delete(obtener(id));
    }

    private Usuario obtener(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + id));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }
}
