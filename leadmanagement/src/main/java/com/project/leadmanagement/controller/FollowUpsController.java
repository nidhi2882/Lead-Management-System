package com.project.leadmanagement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.leadmanagement.entity.FollowUps;

import com.project.leadmanagement.service.FollowUpsService;

@RestController
@RequestMapping("/followups")
public class FollowUpsController {

    @Autowired
    private FollowUpsService followUpService;

    // Create FollowUp
    @PostMapping
    public ResponseEntity<FollowUps> createFollowUp(@RequestBody FollowUps followUp) {
        return ResponseEntity.status(HttpStatus.CREATED).body(followUpService.createFollowUp(followUp));
    }

    // Get All FollowUps
    @GetMapping
    public ResponseEntity<List<FollowUps>> getAllFollowUps() {
        return ResponseEntity.ok(followUpService.findAll());
    }

    // Get FollowUp by ID
    @GetMapping("/{id}")
    public ResponseEntity<FollowUps> getFollowUpById(@PathVariable int id) {
        return ResponseEntity.ok(followUpService.findById(id));
    }

    // Get FollowUps by Lead
    @GetMapping("/lead/{leadId}")
    public ResponseEntity<List<FollowUps>> getFollowUpsByLead(@PathVariable int leadId) {
        return ResponseEntity.ok(followUpService.getFollowUpsByLeadId(leadId));
    }

    // Delete FollowUp
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFollowUp(@PathVariable int id) {
        followUpService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}