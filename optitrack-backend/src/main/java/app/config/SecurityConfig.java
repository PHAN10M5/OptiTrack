package app.config; // Assuming your SecurityConfig is in app.config

import app.security.JwtAuthenticationFilter; // Your custom filter
import app.security.StatelessSecurityContextRepository; // <--- **CRITICAL IMPORT**
import app.service.UserService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserService userService;
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final StatelessSecurityContextRepository statelessSecurityContextRepository; // <-- Correct injection type

    // 1. Ensure this constructor is exactly as below, injecting the new repository
    public SecurityConfig(UserService userService, JwtAuthenticationFilter jwtAuthFilter,
                          StatelessSecurityContextRepository statelessSecurityContextRepository) {
        this.userService = userService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.statelessSecurityContextRepository = statelessSecurityContextRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/punches/**").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers("/api/admin/dashboard/**", "/api/employees/**").hasRole("ADMIN")
                        .requestMatchers("/api/employee/dashboard/**").hasRole("EMPLOYEE")
                        .requestMatchers("/admin-dashboard/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .securityContext(securityContext ->
                        securityContext.securityContextRepository(statelessSecurityContextRepository)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}