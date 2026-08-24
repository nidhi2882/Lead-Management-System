package com.project.leadmanagement.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.leadmanagement.entity.Users;
public interface UserRepository extends JpaRepository<Users,Integer> {
	Optional<Users> findByEmail(String email);
	
	List<Users> findByAssignedRole_Name(String string);
}
