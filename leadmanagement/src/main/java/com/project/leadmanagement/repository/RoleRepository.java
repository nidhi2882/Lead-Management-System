package com.project.leadmanagement.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.leadmanagement.entity.Role;
public interface RoleRepository extends JpaRepository<Role,Long>{
	Optional<Role> findByName(String name);
}
