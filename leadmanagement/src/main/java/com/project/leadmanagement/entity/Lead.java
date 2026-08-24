package com.project.leadmanagement.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.project.leadmanagement.enums.LeadStatus;
@Entity
@Table(name="leads", indexes = {
    @Index(name = "idx_lead_status", columnList = "status"),
    @Index(name = "idx_lead_assigned_user", columnList = "assigned_user")
})
public class Lead {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	private String name;
	private String email;
	private String phone;
	private String source;
	
	@Enumerated(EnumType.STRING)
	private LeadStatus status;
	
	 private LocalDateTime createdAt;
	 private LocalDateTime updatedAt;
	 
	// Relationship with User
	 @ManyToOne
	 @JoinColumn(name = "assigned_user")
	 private Users assignedUser;
	 
	 @OneToMany(mappedBy = "lead")
	 @JsonManagedReference
	 private List<FollowUps> followUps;
	  
	 public Integer getId() {
		 return id;
	 }
	 public void setId(Integer id) {
		 this.id = id;
	 }
	 public String getName() {
		 return name;
	 }
	 public void setName(String name) {
		 this.name = name;
	 }
	 public String getEmail() {
		 return email;
	 }
	 public void setEmail(String email) {
		 this.email = email;
	 }
	 public String getPhone() {
		 return phone;
	 }
	 public void setPhone(String phone) {
		 this.phone = phone;
	 }
	 public String getSource() {
		 return source;
	 }
	 public void setSource(String source) {
		 this.source = source;
	 }
	 public LeadStatus getStatus() {
		 return status;
	 }
	 public void setStatus(LeadStatus status) {
		 this.status = status;
	 }
	 public LocalDateTime getCreatedAt() {
		 return createdAt;
	 }
	 public void setCreatedAt(LocalDateTime createdAt) {
		 this.createdAt = createdAt;
	 }
	 public LocalDateTime getUpdatedAt() {
		 return updatedAt;
	 }
	 public void setUpdatedAt(LocalDateTime updatedAt) {
		 this.updatedAt = updatedAt;
	 }
	 public Lead(Integer id, String name, String email, String phone, String source, LeadStatus status,
			LocalDateTime createdAt, LocalDateTime updatedAt) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.source = source;
		this.status = status;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	 }
	 public Lead() {}
	 
	 @PrePersist
	 public void prePersist() {
	     this.createdAt = LocalDateTime.now();
	     this.updatedAt = LocalDateTime.now();
	 }

	 @PreUpdate
	 public void preUpdate() {
	     this.updatedAt = LocalDateTime.now();
	 }
	 public Users getAssignedUser() {
		return assignedUser;
	 }
	 
	 // ✅ ADDED: Missing setter
	 public void setAssignedUser(Users assignedUser) {
		 this.assignedUser = assignedUser;
	 }

	 // ✅ ADDED: Missing getter for followUps
	 public List<FollowUps> getFollowUps() {
		 return followUps;
	 }

	 // ✅ ADDED: Missing setter for followUps (optional but recommended)
	 public void setFollowUps(List<FollowUps> followUps) {
		 this.followUps = followUps;
	 }
}