package com.project.leadmanagement.service;

import java.util.List;
import com.project.leadmanagement.dto.*;

public interface AnalyticsService {
    AnalyticsOverviewDTO getOverview();
    List<LeadStatusAnalyticsDTO> getLeadsByStatus();
    List<SalesUserPerformanceDTO> getSalesPerformance();
    FollowUpAnalyticsDTO getFollowUpAnalytics();
    FullAnalyticsReportDTO getFullReport();
}
