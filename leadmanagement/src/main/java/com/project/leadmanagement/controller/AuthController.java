package com.project.leadmanagement.controller;
import com.project.leadmanagement.entity.UserStatus;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.project.leadmanagement.dto.AuthResponse;
import com.project.leadmanagement.dto.LoginRequest;
import com.project.leadmanagement.dto.RegisterRequest;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.service.UsersService;
import com.project.leadmanagement.security.JwtUtil;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsersService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        Users user = userService.findByEmail(request.getEmail());

        if (user != null
                && passwordEncoder.matches(request.getPassword(), user.getPassword())
                && user.getAssignedRole() != null) {

            // User has registered but is waiting for admin approval
            if (user.getStatus() == UserStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account is pending administrator approval. Please contact your system administrator."
                        ));
            }

            // Admin has rejected the registration
            if (user.getStatus() == UserStatus.REJECTED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account registration request was rejected by an administrator."
                        ));
            }

            // Only APPROVED users can receive a JWT
            String role = user.getAssignedRole().getName();
            String token = jwtUtil.generateToken(user.getEmail(), role);

            AuthResponse response = new AuthResponse(
                    token,
                    role,
                    user.getId(),
                    user.getName(),
                    user.getEmail()
            );

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        // Check if user already exists
        if (userService.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User with this email already exists"));
        }

        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Security Restriction: Creating additional Admin accounts is strictly forbidden. All new accounts must be Sales Executives (roleId = 2).
        if (request.getRoleId() != null && request.getRoleId() == 1L) {
            return ResponseEntity.badRequest().body(Map.of("message", "Creating additional Administrator accounts is not allowed. Only Sales Executives can be created."));
        }

        Long targetRoleId = 2L; // Always Sales Executive
        user.setAssignedRole(userService.getRoleById(targetRoleId));

        // New self-registered users must wait for admin approval
        user.setStatus(UserStatus.PENDING);

        userService.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message",
                        "Registration successful. Your account is pending administrator approval."
                ));
    }
}