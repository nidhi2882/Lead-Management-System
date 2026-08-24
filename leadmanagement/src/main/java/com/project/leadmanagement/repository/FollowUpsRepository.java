package com.project.leadmanagement.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.leadmanagement.entity.FollowUps;
import com.project.leadmanagement.entity.Lead;

public interface FollowUpsRepository extends JpaRepository <FollowUps,Integer> {
	List<FollowUps> findByLead(Lead lead);
	List<FollowUps> findByLeadId(Integer leadId);
	
}
