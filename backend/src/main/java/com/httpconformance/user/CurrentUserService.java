package com.httpconformance.user;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User getOrCreateUser(Jwt jwt) {
        if (jwt == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication token is required");
        }

        String authProviderId = jwt.getSubject();
        if (authProviderId == null || authProviderId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token subject is missing");
        }

        return userRepository.findByAuthProviderId(authProviderId)
                .map(user -> updateUserInfoIfChanged(user, jwt))
                .orElseGet(() -> createUserFromJwt(authProviderId, jwt));
    }

    @Transactional
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return getOrCreateUser(jwt);
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unsupported authentication principal");
    }

    private User updateUserInfoIfChanged(User user, Jwt jwt) {
        String email = extractEmail(jwt, user.getAuthProviderId());
        String name = extractName(jwt, email);
        boolean changed = false;

        if (!user.getEmail().equals(email)) {
            user.setEmail(email);
            changed = true;
        }

        if (!user.getName().equals(name)) {
            user.setName(name);
            changed = true;
        }

        return changed ? userRepository.save(user) : user;
    }

    private User createUserFromJwt(String authProviderId, Jwt jwt) {
        String email = extractEmail(jwt, authProviderId);
        String name = extractName(jwt, email);

        User newUser = new User(UUID.randomUUID(), authProviderId, email, name);
        return userRepository.save(newUser);
    }

    private String extractEmail(Jwt jwt, String fallbackSubject) {
        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isBlank()) {
            return email;
        }

        String preferredUsername = jwt.getClaimAsString("preferred_username");
        if (preferredUsername != null && !preferredUsername.isBlank() && preferredUsername.contains("@")) {
            return preferredUsername;
        }

        return fallbackSubject + "@users.httpconform.local";
    }

    private String extractName(Jwt jwt, String fallback) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) {
            return name;
        }

        String nickname = jwt.getClaimAsString("nickname");
        if (nickname != null && !nickname.isBlank()) {
            return nickname;
        }

        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        if (givenName != null && !givenName.isBlank()) {
            return familyName != null && !familyName.isBlank() ? givenName + " " + familyName : givenName;
        }

        return fallback;
    }
}
