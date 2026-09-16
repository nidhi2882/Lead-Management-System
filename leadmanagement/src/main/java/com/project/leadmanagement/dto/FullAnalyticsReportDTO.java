package com.project.leadmanagement.dto;

import java.util.List;

public class FullAnalyticsReportDTO {
    private AnalyticsOverviewDTO overview;
    private List<LeadStatusAnalyticsDTO> leadStatusBreakdown;
    private List<SalesUserPerformanceDTO> salesPerformance;
    private FollowUpAnalyticsDTO followUps;

    public FullAnalyticsReportDTO() {}

    public FullAnalyticsReportDTO(AnalyticsOverviewDTO overview,
                                  List<LeadStatusAnalyticsDTO> leadStatusBreakdown,
                                  List<SalesUserPerformanceDTO> salesPerformance,
                                  FollowUpAnalyticsDTO followUps) {
        this.overview = overview;
        this.leadStatusBreakdown = leadStatusBreakdown;
        this.salesPerformance = salesPerformance;
        this.followUps = followUps;
    }

    public AnalyticsOverviewDTO getOverview() {
        return overview;
    }

    public void setOverview(AnalyticsOverviewDTO overview) {
        this.overview = overview;
    }

    public List<LeadStatusAnalyticsDTO> getLeadStatusBreakdown() {
        return leadStatusBreakdown;
    }

    public void setLeadStatusBreakdown(List<LeadStatusAnalyticsDTO> leadStatusBreakdown) {
        this.leadStatusBreakdown = leadStatusBreakdown;
    }

    public List<SalesUserPerformanceDTO> getSalesPerformance() {
        return salesPerformance;
    }

    public void setSalesPerformance(List<SalesUserPerformanceDTO> salesPerformance) {
        this.salesPerformance = salesPerformance;
    }

    public FollowUpAnalyticsDTO getFollowUps() {
        return followUps;
    }

    public void setFollowUps(FollowUpAnalyticsDTO followUps) {
        this.followUps = followUps;
    }
}
