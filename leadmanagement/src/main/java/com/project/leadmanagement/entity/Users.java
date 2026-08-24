package com.project.leadmanagement.entity;
import jakarta.persistence.*;

import java.security.Principal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
@Entity
@Table(name="users", indexes = {
    @Index(name = "idx_user_email", columnList = "email")
})
public class Users {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer id;
	
	@Column(nullable = false)
	private String name;
	
	@Column(unique = true)
	private String email;
	
	@Column(nullable = false)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String password;
	
	private LocalDateTime createdAt;
	
	//For user->roles
	@ManyToOne
	@JoinColumn(name="role_id")
	private Role assignedRole;

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

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Role getAssignedRole() {
		return assignedRole;
	}

	public void setAssignedRole(Role assignedRole) {
		this.assignedRole = assignedRole;
	}

	public Users(Integer id, String name, String email, String password, LocalDateTime createdAt,
			Role assignedRole) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.password = password;
		this.createdAt = createdAt;
		this.assignedRole = assignedRole;
	}
	public Users() {}
	@PrePersist
	public void prePersist() {
	    this.createdAt = LocalDateTime.now();
	}

}
