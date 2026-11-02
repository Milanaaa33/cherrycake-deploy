package uz.itpu.cherrycake.config;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import uz.itpu.cherrycake.security.CustomUserDetailsService;
import uz.itpu.cherrycake.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig
{
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
    {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests
            (
                auth -> auth
                // Permit internal forwards & errors (e.g. forward to /index.html or /error)
                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                // Spring Boot standard static resources
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                // Public Endpoints & Static UI
                .requestMatchers
                (
                    "/",
                    "/index.html",
                    "/favicon.ico",
                    "/api/v1/auth/**",
                    "/api/v1/catalog/**",
                    "/api/v1/cart/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/assets/**",
                    "/error",
                    "/error/**",
                    "/error.html"
                ).permitAll()
                // Public creation of orders & bookings (allows guest order & table booking)
                .requestMatchers(HttpMethod.POST, "/api/v1/orders", "/api/v1/bookings").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/orders/{orderNumber}", "/api/v1/bookings/{bookingNumber}").permitAll()
                // Admin / Reporting Endpoints
                .requestMatchers("/api/v1/admin/**", "/api/v1/reports/**").hasRole("ADMIN")
                // Any other request must be authenticated
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider()
    {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception { return config.getAuthenticationManager(); }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}