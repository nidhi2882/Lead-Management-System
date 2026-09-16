package com.project.leadmanagement.dto;

public class SalesUserPerformanceDTO {
    private Integer userId;
    private String userName;
    private String userEmail;
    private long assignedLeads;
    private long convertedLeads;
    private long lostLeads;
    private double conversionRate;

    public SalesUserPerformanceDTO() {}

    public SalesUserPerformanceDTO(Integer userId, String userName, String userEmail, long assignedLeads,
                                  long convertedLeads, long lostLeads, double conversionRate) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.assignedLeads = assignedLeads;
        this.convertedLeads = convertedLeads;
        this.lostLeads = lostLeads;
        this.conversionRate = conversionRate;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public long getAssignedLeads() {
        return assignedLeads;
    }

    public void setAssignedLeads(long assignedLeads) {
        this.assignedLeads = assignedLeads;
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
}
