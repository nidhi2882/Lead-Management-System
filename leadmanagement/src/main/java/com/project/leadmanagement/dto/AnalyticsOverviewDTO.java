package com.project.leadmanagement.dto;

public class AnalyticsOverviewDTO {
    private long totalLeads;
    private long newLeads;
    private long contactedLeads;
    private long qualifiedLeads;
    private long convertedLeads;
    private long lostLeads;
    private double conversionRate;
    private long totalSalesUsers;
    private long pendingApprovals;
    private long upcomingFollowUps;

    public AnalyticsOverviewDTO() {}

    public AnalyticsOverviewDTO(long totalLeads, long newLeads, long contactedLeads, long qualifiedLeads,
                                long convertedLeads, long lostLeads, double conversionRate,
                                long totalSalesUsers, long pendingApprovals, long upcomingFollowUps) {
        this.totalLeads = totalLeads;
        this.newLeads = newLeads;
        this.contactedLeads = contactedLeads;
        this.qualifiedLeads = qualifiedLeads;
        this.convertedLeads = convertedLeads;
        this.lostLeads = lostLeads;
        this.conversionRate = conversionRate;
        this.totalSalesUsers = totalSalesUsers;
        this.pendingApprovals = pendingApprovals;
        this.upcomingFollowUps = upcomingFollowUps;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getNewLeads() {
        return newLeads;
    }

    public void setNewLeads(long newLeads) {
        this.newLeads = newLeads;
    }

    public long getContactedLeads() {
        return contactedLeads;
    }

    public void setContactedLeads(long contactedLeads) {
        this.contactedLeads = contactedLeads;
    }

    public long getQualifiedLeads() {
        return qualifiedLeads;
    }

    public void setQualifiedLeads(long qualifiedLeads) {
        this.qualifiedLeads = qualifiedLeads;
    }

    public long getConvertedLeads() {
        return convertedLeads;
    }

    public void setConvertedLeads(long convertedLeads) {
        this.convertedLeads = convertedLeads;
    }

    public long getLostLeads() {
        return lostLeads;
    }

    public void setLostLeads(long lostLeads) {
        this.lostLeads = lostLeads;
    }

    public double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(double conversionRate) {
        this.conversionRate = conversionRate;
    }

    public long getTotalSalesUsers() {
        return totalSalesUsers;
    }

    public void setTotalSalesUsers(long totalSalesUsers) {
        this.totalSalesUsers = totalSalesUsers;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public long getUpcomingFollowUps() {
        return upcomingFollowUps;
    }

    public void setUpcomingFollowUps(long upcomingFollowUps) {
        this.upcomingFollowUps = upcomingFollowUps;
    }
}
