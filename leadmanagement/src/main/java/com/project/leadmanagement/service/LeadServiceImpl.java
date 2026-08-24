package com.project.leadmanagement.service;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

import com.project.leadmanagement.entity.Lead;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.enums.LeadStatus;
import com.project.leadmanagement.exception.ResourceNotFoundException;
import com.project.leadmanagement.repository.LeadRepository;
import com.project.leadmanagement.repository.UserRepository;
@Service
public class LeadServiceImpl implements LeadService {
	private final LeadRepository leadRepository;
	private final UserRepository usersRepository;

	@Autowired
	public LeadServiceImpl(LeadRepository leadRepository, UserRepository usersRepository) {
	    this.leadRepository = leadRepository;
	    this.usersRepository = usersRepository;
	}
	@Override
	public Lead createLead(Lead lead) {
	    return createLead(lead, false); // default = manual
	}
	private int currentUserIndex = 0;

	@Override
	public Lead createLead(Lead lead, boolean autoAssign) {

	    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

	    boolean isAdmin = auth.getAuthorities().stream()
	        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

	    if (autoAssign && !isAdmin) {
	        throw new AccessDeniedException("Only ADMIN can auto assign leads");
	    }

	    if (autoAssign && isAdmin) {
	        List<Users> salesUsers = usersRepository.findByAssignedRole_Name("ROLE_SALES");

	        if (salesUsers.isEmpty()) {
	            throw new RuntimeException("No SALES users available");
	        }

	        Users assignedUser = salesUsers.get(currentUserIndex);
	        lead.setAssignedUser(assignedUser);

	        currentUserIndex = (currentUserIndex + 1) % salesUsers.size();
	    }

	    return leadRepository.save(lead);
	}
	 @Override
	 @Transactional(readOnly = true)
	 public List<Lead> findAll() {
		
		return leadRepository.findAll();
	 }
	 @Override
	 @Transactional(readOnly = true)
	 public Lead findById(int id) {
		return leadRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
	 }
	 @Override
	 public Lead updateLead(Lead lead, int id) {
	     Lead existing = leadRepository.findById(id)
	     		.orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
	     existing.setName(lead.getName());
	     existing.setEmail(lead.getEmail());
	     existing.setPhone(lead.getPhone());
	     existing.setSource(lead.getSource());
	     existing.setStatus(lead.getStatus());
	     return leadRepository.save(existing);
	 }
	 @Override
	 @Transactional
	 public void deleteById(int id) {
		try {
			leadRepository.deleteById(id);
		} catch (EmptyResultDataAccessException ex) {
			throw new ResourceNotFoundException("Lead not found");
		}
		
	 }
	 @Override
	 @Transactional
	 public Lead assignLead(int leadId, int userId) {
	     Lead lead = leadRepository.findById(leadId)
	             .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

	     Users user = usersRepository.findById(userId)
	             .orElseThrow(() -> new ResourceNotFoundException("User not found"));

	     lead.setAssignedUser(user);
	     return leadRepository.save(lead);
	 }
	 @Override
	 @Transactional
	 public Lead updateStatus(int id, String status) {
	     Lead lead = findById(id);
	     lead.setStatus(LeadStatus.valueOf(status.toUpperCase()));
	     return leadRepository.save(lead);
	 }
	 @Override
	 @Transactional(readOnly = true)
	 public List<Lead> getLeadsByStatus(String status) {
	     return leadRepository.findByStatus(LeadStatus.valueOf(status.toUpperCase()));
	 }
	 @Override
	 @Transactional(readOnly = true)
	 public List<Lead> getLeadsByUser(int userId) {
	     return leadRepository.findByAssignedUserId(userId);
	 }
	 @Override
	 @Transactional(readOnly = true)
	 public List<Lead> getLeadsForUser(Authentication authentication) {

	     String email = authentication.getName();

	     Users user = usersRepository.findByEmail(email)
	             .orElseThrow(() -> new RuntimeException("User not found"));

	     boolean isAdmin = authentication.getAuthorities()
	             .stream()
	             .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

	     if (isAdmin) {
	         return leadRepository.findAll();  
	     } else {
	         return leadRepository.findByAssignedUser(user); // 👨‍💼 Sales
	     }
	 }

	 // ✅ ADDED: Missing patchLead implementation
	 @Override
	 @Transactional
	 public Lead patchLead(int id, Map<String, Object> body) {
	     Lead lead = findById(id);
	     
	     body.forEach((key, value) -> {
	         switch(key) {
	             case "name":
	                 lead.setName((String) value);
	                 break;
	             case "email":
	                 lead.setEmail((String) value);
	                 break;
	             case "phone":
	                 lead.setPhone((String) value);
	                 break;
	             case "source":
	                 lead.setSource((String) value);
	                 break;
	             case "status":
	                 if (value != null) {
	                     lead.setStatus(LeadStatus.valueOf(((String) value).toUpperCase()));
	                 }
	                 break;
	             default:
	                 // Ignore unknown fields
	                 break;
	         }
	     });
	     
	     return leadRepository.save(lead);
	 }
	 @Override
	 public void autoAssignExistingLeads() {

	     List<Lead> unassignedLeads =
	         leadRepository.findByAssignedUserIsNull();

	     List<Users> salesUsers =
	         usersRepository.findByAssignedRole_Name("ROLE_SALES");

	     if (salesUsers.isEmpty()) {
	         throw new RuntimeException("No sales users available");
	     }

	     int index = 0;

	     for (Lead lead : unassignedLeads) {
	         lead.setAssignedUser(salesUsers.get(index));
	         leadRepository.save(lead);

	         index = (index + 1) % salesUsers.size();
	     }
	 }
	 
}