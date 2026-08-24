package com.project.leadmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authentication is not required for login/register
        if (path.startsWith("/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            if (jwtUtil.validateToken(token)) {

                try {
                    String email = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token);

                    if (email != null &&
                            SecurityContextHolder.getContext().getAuthentication() == null) {

                        String formattedRole =
                                role.startsWith("ROLE_")
                                        ? role
                                        : "ROLE_" + role;

                        List<SimpleGrantedAuthority> authorities =
                                List.of(new SimpleGrantedAuthority(formattedRole));

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        authorities
                                );

                        SecurityContextHolder.getContext()
                                .setAuthentication(authToken);
                    }

                } catch (Exception e) {

                    SecurityContextHolder.clearContext();

                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");

                    response.getWriter().write(
                            "{\"error\":\"Unauthorized\",\"message\":\"Invalid token payload\"}"
                    );

                    return;
                }

            } else {

                SecurityContextHolder.clearContext();

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");

                response.getWriter().write(
                        "{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired JWT token\"}"
                );

                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}