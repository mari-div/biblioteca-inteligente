package com.biblioteca.security;

import com.biblioteca.model.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Comprueba que quien hace la petición actúa en nombre de sí mismo.
 * El personal (bibliotecario y administrador) puede actuar por cualquier usuario.
 */
@Component
public class UsuarioActual {

    private final UsuarioRepository usuarioRepository;

    public UsuarioActual(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void exigirPropio(Authentication authentication, Long idUsuario) {
        if (esPersonal(authentication)) {
            return;
        }

        Long idActual = usuarioRepository.findByEmail(authentication.getName())
                .map(Usuario::getIdUsuario)
                .orElseThrow(() -> new AccessDeniedException("El usuario del token ya no existe"));

        if (!idActual.equals(idUsuario)) {
            throw new AccessDeniedException("Solo puedes hacer esto a tu nombre");
        }
    }

    public boolean esPersonal(Authentication authentication) {
        for (GrantedAuthority autoridad : authentication.getAuthorities()) {
            String rol = autoridad.getAuthority();
            if (rol.equals("ROLE_BIBLIOTECARIO") || rol.equals("ROLE_ADMINISTRADOR")) {
                return true;
            }
        }
        return false;
    }
}
