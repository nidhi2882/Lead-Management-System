package com.project.leadmanagement.config;

import com.project.leadmanagement.entity.Role;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.repository.RoleRepository;
import com.project.leadmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize Roles if missing
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

        // Initialize Default Admin User if missing
        if (userRepository.findByEmail("admin@company.com").isEmpty()) {
            Users admin = new Users();
            admin.setName("System Admin");
            admin.setEmail("admin@company.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setAssignedRole(adminRole);
            userRepository.save(admin);
            System.out.println("✅ Created default Admin account: admin@company.com / admin123");
        }

        // Initialize Default Sales User if missing
        if (userRepository.findByEmail("sales@company.com").isEmpty()) {
            Users sales = new Users();
            sales.setName("Rahul Sales");
            sales.setEmail("sales@company.com");
            sales.setPassword(passwordEncoder.encode("sales123"));
            sales.setAssignedRole(salesRole);
            userRepository.save(sales);
            System.out.println("✅ Created default Sales account: sales@company.com / sales123");
        }
    }
}
