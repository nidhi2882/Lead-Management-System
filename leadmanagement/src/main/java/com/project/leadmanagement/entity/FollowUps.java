package com.project.leadmanagement.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime; 

import com.fasterxml.jackson.annotation.JsonBackReference;
@Entity
@Table(name = "followups")
public class FollowUps {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	private String note;
	private LocalDateTime nextFollowUpDate;
	private LocalDateTime createdAt;
	
	 // Many FollowUps → One Lead
    @ManyToOne
    @JoinColumn(name = "lead_id")
    @JsonBackReference
    private Lead lead;
    public FollowUps() {}
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
	public LocalDateTime getNextFollowUpDate() {
		return nextFollowUpDate;
	}
	public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) {
		this.nextFollowUpDate = nextFollowUpDate;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public Lead getLead() {
		return lead;
	}
	public void setLead(Lead lead) {
		this.lead = lead;
	}
	public FollowUps(Integer id, String note, LocalDateTime nextFollowUpDate, LocalDateTime createdAt,
			Lead lead) {
		super();
		this.id = id;
		this.note = note;
		this.nextFollowUpDate = nextFollowUpDate;
		this.createdAt = createdAt;
		this.lead = lead;
	}
	
	@PrePersist
	public void prePersist() {
	    this.createdAt = LocalDateTime.now();
	}
	
	
	
}
