package com.project.leadmanagement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.project.leadmanagement.dto.*;
import com.project.leadmanagement.service.AnalyticsService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDTO> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/leads-by-status")
    public ResponseEntity<List<LeadStatusAnalyticsDTO>> getLeadsByStatus() {
        return ResponseEntity.ok(analyticsService.getLeadsByStatus());
    }

    @GetMapping("/sales-performance")
    public ResponseEntity<List<SalesUserPerformanceDTO>> getSalesPerformance() {
        return ResponseEntity.ok(analyticsService.getSalesPerformance());
    }

    @GetMapping("/followups")
    public ResponseEntity<FollowUpAnalyticsDTO> getFollowUpAnalytics() {
        return ResponseEntity.ok(analyticsService.getFollowUpAnalytics());
    }

    @GetMapping("/full-report")
    public ResponseEntity<FullAnalyticsReportDTO> getFullReport() {
        return ResponseEntity.ok(analyticsService.getFullReport());
    }
}
