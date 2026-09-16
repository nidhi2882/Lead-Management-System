package com.project.leadmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.leadmanagement.entity.Lead;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.enums.LeadStatus;

public interface LeadRepository extends JpaRepository<Lead, Integer> {

	@Override
	@EntityGraph(attributePaths = {"assignedUser"})
	List<Lead> findAll();

	@Override
	@EntityGraph(attributePaths = {"assignedUser"})
	Optional<Lead> findById(Integer id);

	@EntityGraph(attributePaths = {"assignedUser"})
	Optional<Lead> findByEmail(String email);

	@EntityGraph(attributePaths = {"assignedUser"})
	List<Lead> findByStatus(LeadStatus status);

	@EntityGraph(attributePaths = {"assignedUser"})
	List<Lead> findByAssignedUser(Users user);

	@EntityGraph(attributePaths = {"assignedUser"})
	List<Lead> findByAssignedUserId(int userId);

	@EntityGraph(attributePaths = {"assignedUser"})
	List<Lead> findByAssignedUserEmail(String email);

	@EntityGraph(attributePaths = {"assignedUser"})
	List<Lead> findByAssignedUserIsNull();

	long countByStatus(LeadStatus status);

	long countByAssignedUserId(int userId);

	long countByAssignedUserIdAndStatus(int userId, LeadStatus status);
}
