package com.project.leadmanagement.service;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;

import com.project.leadmanagement.entity.Lead;
public interface LeadService {
	Lead createLead(Lead lead, boolean autoAssign);
	Lead createLead(Lead lead);
	List <Lead> findAll();
	Lead findById(int id);
	Lead updateLead(Lead lead,int id);
	void deleteById(int id);
	Lead assignLead(int leadId, int userId);
	Lead updateStatus(int id, String status);
	List<Lead> getLeadsByStatus(String status);
	List<Lead> getLeadsByUser(int userId);
	List<Lead> getLeadsForUser(Authentication authentication);
	Lead patchLead(int id, Map<String, Object> body);  // ✅ ADDED
	void autoAssignExistingLeads();
	
}