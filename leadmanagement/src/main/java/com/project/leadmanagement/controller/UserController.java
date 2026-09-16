package com.project.leadmanagement.controller;
import com.project.leadmanagement.entity.UserStatus;
import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.service.UsersService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UsersService userService;

    // Create User
    @PostMapping
    public ResponseEntity<Users> createUser(@RequestBody Users user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
    }

    // Get All Users
    @GetMapping
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    // Get User by ID
    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // Update User
    @PutMapping("/{id}")
    public ResponseEntity<Users> updateUser(@RequestBody Users user, @PathVariable int id) {
        return ResponseEntity.ok(userService.updateUser(user, id));
    }

    // Delete User
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {

        String statusValue = body.get("status");

        if (statusValue == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Status is required"));
        }

        UserStatus status;

        try {
            status = UserStatus.valueOf(statusValue.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Status must be APPROVED or REJECTED"
                    ));
        }

        // Only approval/rejection should be performed through this endpoint
        if (status != UserStatus.APPROVED && status != UserStatus.REJECTED) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Status must be APPROVED or REJECTED"
                    ));
        }

        Users user = userService.findById(id);

        // Only PENDING users can be approved/rejected
        if (user.getStatus() != UserStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Only pending users can be approved or rejected"
                    ));
        }

        Users updatedUser = userService.updateUserStatus(id, status);

        return ResponseEntity.ok(updatedUser);
    }
}