package com.project.leadmanagement.controller;

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

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
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

        // Default role: Sales (roleId = 2) if not specified or roleId = 2
        Long targetRoleId = (request.getRoleId() != null) ? request.getRoleId() : 2L;
        user.setAssignedRole(userService.getRoleById(targetRoleId));

        userService.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}