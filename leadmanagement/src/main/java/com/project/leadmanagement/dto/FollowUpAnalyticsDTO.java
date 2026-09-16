package com.project.leadmanagement.dto;

public class FollowUpAnalyticsDTO {
    private long totalFollowUps;
    private long upcomingFollowUps;
    private long overdueFollowUps;
    private long completedFollowUps;

    public FollowUpAnalyticsDTO() {}

    public FollowUpAnalyticsDTO(long totalFollowUps, long upcomingFollowUps, long overdueFollowUps, long completedFollowUps) {
        this.totalFollowUps = totalFollowUps;
        this.upcomingFollowUps = upcomingFollowUps;
        this.overdueFollowUps = overdueFollowUps;
        this.completedFollowUps = completedFollowUps;
    }

    public long getTotalFollowUps() {
        return totalFollowUps;
    }

    public void setTotalFollowUps(long totalFollowUps) {
        this.totalFollowUps = totalFollowUps;
    }

    public long getUpcomingFollowUps() {
        return upcomingFollowUps;
    }

    public void setUpcomingFollowUps(long upcomingFollowUps) {
        this.upcomingFollowUps = upcomingFollowUps;
    }

    public long getOverdueFollowUps() {
        return overdueFollowUps;
    }

    public void setOverdueFollowUps(long overdueFollowUps) {
        this.overdueFollowUps = overdueFollowUps;
    }

    public long getCompletedFollowUps() {
        return completedFollowUps;
    }

    public void setCompletedFollowUps(long completedFollowUps) {
        this.completedFollowUps = completedFollowUps;
    }
}
