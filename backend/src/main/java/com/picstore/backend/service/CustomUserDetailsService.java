package com.picstore.backend.service;

import com.picstore.backend.model.User;
import com.picstore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginIdentifier)
            throws UsernameNotFoundException {

        return findByLoginIdentifier(loginIdentifier)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found")
                );
    }

    private Optional<User> findByLoginIdentifier(String loginIdentifier) {
        if (loginIdentifier.contains("@")) {
            return userRepository.findByEmail(loginIdentifier)
                    .or(() -> userRepository.findByUsername(loginIdentifier));
        }

        return userRepository.findByUsername(loginIdentifier)
                .or(() -> userRepository.findByEmail(loginIdentifier));
    }
}
