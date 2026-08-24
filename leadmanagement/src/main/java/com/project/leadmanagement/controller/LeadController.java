package com.project.leadmanagement.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.project.leadmanagement.entity.Lead;

import com.project.leadmanagement.service.LeadService;

@RestController
@RequestMapping("/leads")
public class LeadController {

    @Autowired
    private LeadService leadService;

    @PostMapping
    public ResponseEntity<Lead> addLead(
            @RequestBody Lead lead,
            @RequestParam(required = false, defaultValue = "false") boolean autoAssign) {

        Lead saved = leadService.createLead(lead, autoAssign);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<Lead>> getAllLeads(Authentication authentication) {
        // ✅ CORRECT - filters by authenticated user
        return ResponseEntity.ok(leadService.getLeadsForUser(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lead> findById(@PathVariable int id) {
        return ResponseEntity.ok(leadService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateByLead(
            @RequestBody Lead lead,
            @PathVariable int id) {

        Lead updated = leadService.updateLead(lead, id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable int id) {
        leadService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{leadId}/assign/{userId}")
    public ResponseEntity<Lead> assignLead(
            @PathVariable int leadId,
            @PathVariable int userId) {

        return ResponseEntity.ok(leadService.assignLead(leadId, userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Lead> updateStatus(
            @PathVariable int id,
            @RequestParam String status) {

        return ResponseEntity.ok(leadService.updateStatus(id, status));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Lead> patchLead(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        Lead updatedLead = leadService.patchLead(id, body);
        return ResponseEntity.ok(updatedLead);
    
    }
    @PostMapping("/auto-assign")
    public ResponseEntity<String> autoAssignExistingLeads() {
        leadService.autoAssignExistingLeads();
        return ResponseEntity.ok("Leads assigned");
    }
}