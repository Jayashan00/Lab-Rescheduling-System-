package com.uor.engineering.labreschedulingsystem.config;

import com.uor.engineering.labreschedulingsystem.security.JwtAuthenticationEntryPoint;
import com.uor.engineering.labreschedulingsystem.security.JwtAuthenticationFilter;
import com.uor.engineering.labreschedulingsystem.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/files/**").permitAll()
                        .requestMatchers("/api/dashboard/**").hasAnyRole("STUDENT", "LAB_ADVISOR", "MODULE_COORDINATOR", "LAB_COORDINATOR", "ADMIN")
                        .requestMatchers("/api/requests/**").hasAnyRole("STUDENT", "LAB_ADVISOR", "MODULE_COORDINATOR", "LAB_COORDINATOR", "ADMIN")
                        .requestMatchers("/api/appeals/**").hasAnyRole("STUDENT",  "ADMIN")
                        .requestMatchers("/api/appeals/review").hasRole("ADMIN")
                        .requestMatchers("/api/appeals/pending").hasRole("ADMIN")
                        .requestMatchers("/api/modules/**").hasAnyRole("LAB_ADVISOR", "MODULE_COORDINATOR", "LAB_COORDINATOR", "ADMIN")
                        .requestMatchers("/api/resources/**").hasAnyRole("LAB_COORDINATOR", "ADMIN")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/instructors/**").hasAnyRole("LAB_COORDINATOR", "ADMIN","STUDENT")
                        .requestMatchers("/api/lab-rooms/**").hasAnyRole("LAB_COORDINATOR", "ADMIN","STUDENT")
                        .requestMatchers("/api/teaching-assistants/**").hasAnyRole("LAB_COORDINATOR", "ADMIN","STUDENT")
                        .requestMatchers("/api/appeals/reviewed").hasRole("ADMIN")
                        .requestMatchers("/api/appeals/pending").hasRole("ADMIN")
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}