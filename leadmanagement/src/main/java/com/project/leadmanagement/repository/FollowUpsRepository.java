package com.project.leadmanagement.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.leadmanagement.entity.FollowUps;
import com.project.leadmanagement.entity.Lead;

import java.time.LocalDateTime;

public interface FollowUpsRepository extends JpaRepository <FollowUps,Integer> {
	List<FollowUps> findByLead(Lead lead);
	List<FollowUps> findByLeadId(Integer leadId);

	long countByNextFollowUpDateGreaterThanEqual(LocalDateTime dateTime);
	long countByNextFollowUpDateLessThan(LocalDateTime dateTime);
	long countByNextFollowUpDateIsNull();
}
