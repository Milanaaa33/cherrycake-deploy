package uz.itpu.cherrycake.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.itpu.cherrycake.common.exception.BadRequestException;
import uz.itpu.cherrycake.common.exception.ConflictException;
import uz.itpu.cherrycake.dto.request.LoginRequest;
import uz.itpu.cherrycake.dto.request.RegisterRequest;
import uz.itpu.cherrycake.dto.response.AuthResponse;
import uz.itpu.cherrycake.model.entity.User;
import uz.itpu.cherrycake.repository.UserRepository;
import uz.itpu.cherrycake.security.CustomUserDetailsService;
import uz.itpu.cherrycake.security.JwtService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService
{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request)
    {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail()))
            throw new ConflictException("User with email '" + request.getEmail() + "' already exists");

        User user = User.builder()
            .email(request.getEmail().toLowerCase().trim())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName().trim())
            .phone(request.getPhone())
            .role("ROLE_USER")
            .createdAt(LocalDateTime.now())
            .build();

        User savedUser = userRepository.save(user);

        var userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .userId(savedUser.getId())
            .email(savedUser.getEmail())
            .fullName(savedUser.getFullName())
            .role(savedUser.getRole())
            .build();
    }

    public AuthResponse login(LoginRequest request)
    {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword()));

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim()).orElseThrow(() -> new BadRequestException("Invalid email or password"));

        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .build();
    }

    public User getCurrentAuthenticatedUser()
    {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal()))
            return null;
        return userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
    }
}