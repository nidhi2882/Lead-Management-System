package com.project.leadmanagement.config;
import com.project.leadmanagement.entity.UserStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.project.leadmanagement.entity.Role;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.repository.RoleRepository;
import com.project.leadmanagement.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles if missing
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setName("ROLE_ADMIN");
            return roleRepository.save(role);
        });

        Role salesRole = roleRepository.findByName("ROLE_SALES").orElseGet(() -> {
            Role role = new Role();
            role.setName("ROLE_SALES");
            return roleRepository.save(role);
        });

        // 2. Ensure Default Admin User admin@leadmanagement.com exists with valid credentials
        Users admin = userRepository.findByEmail("admin@leadmanagement.com").orElseGet(() -> {
            Users newAdmin = new Users();
            newAdmin.setEmail("admin@leadmanagement.com");
            return newAdmin;
        });

        admin.setName("System Administrator");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setAssignedRole(adminRole);
        admin.setStatus(UserStatus.APPROVED);
        userRepository.save(admin);
    }
}
