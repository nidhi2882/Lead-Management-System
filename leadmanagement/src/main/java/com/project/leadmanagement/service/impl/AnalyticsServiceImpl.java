package com.project.leadmanagement.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.leadmanagement.dto.*;
import com.project.leadmanagement.entity.UserStatus;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.enums.LeadStatus;
import com.project.leadmanagement.repository.FollowUpsRepository;
import com.project.leadmanagement.repository.LeadRepository;
import com.project.leadmanagement.repository.UserRepository;
import com.project.leadmanagement.service.AnalyticsService;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final FollowUpsRepository followUpsRepository;

    @Autowired
    public AnalyticsServiceImpl(LeadRepository leadRepository,
                                UserRepository userRepository,
                                FollowUpsRepository followUpsRepository) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.followUpsRepository = followUpsRepository;
    }

    @Override
    public AnalyticsOverviewDTO getOverview() {
        long totalLeads = leadRepository.count();
        long newLeads = leadRepository.countByStatus(LeadStatus.NEW);
        long contactedLeads = leadRepository.countByStatus(LeadStatus.CONTACTED);
        long qualifiedLeads = leadRepository.countByStatus(LeadStatus.QUALIFIED);
        long convertedLeads = leadRepository.countByStatus(LeadStatus.CONVERTED);
        long lostLeads = leadRepository.countByStatus(LeadStatus.LOST);

        double conversionRate = totalLeads > 0 ? (double) convertedLeads / totalLeads * 100.0 : 0.0;
        conversionRate = Math.round(conversionRate * 10.0) / 10.0;

        // Sales users (RoleId = 2)
        long totalSalesUsers = userRepository.countByAssignedRole_Id(2L);
        long pendingApprovals = userRepository.countByStatus(UserStatus.PENDING);

        // Upcoming follow-ups
        long upcomingFollowUps = followUpsRepository.countByNextFollowUpDateGreaterThanEqual(LocalDateTime.now());

        return new AnalyticsOverviewDTO(
                totalLeads,
                newLeads,
                contactedLeads,
                qualifiedLeads,
                convertedLeads,
                lostLeads,
                conversionRate,
                totalSalesUsers,
                pendingApprovals,
                upcomingFollowUps
        );
    }

    @Override
    public List<LeadStatusAnalyticsDTO> getLeadsByStatus() {
        long totalLeads = leadRepository.count();
        List<LeadStatusAnalyticsDTO> list = new ArrayList<>();

        for (LeadStatus status : LeadStatus.values()) {
            long count = leadRepository.countByStatus(status);
            double percentage = totalLeads > 0 ? (double) count / totalLeads * 100.0 : 0.0;
            percentage = Math.round(percentage * 10.0) / 10.0;

            String label = status.name().substring(0, 1).toUpperCase() + status.name().substring(1).toLowerCase();
            list.add(new LeadStatusAnalyticsDTO(status.name(), label, count, percentage));
        }

        return list;
    }

    @Override
    public List<SalesUserPerformanceDTO> getSalesPerformance() {
        // Retrieve sales users (roleId = 2)
        List<Users> salesUsers = userRepository.findByAssignedRole_Id(2L);
        List<SalesUserPerformanceDTO> performanceList = new ArrayList<>();

        for (Users salesUser : salesUsers) {
            int userId = salesUser.getId();
            long assigned = leadRepository.countByAssignedUserId(userId);
            long converted = leadRepository.countByAssignedUserIdAndStatus(userId, LeadStatus.CONVERTED);
            long lost = leadRepository.countByAssignedUserIdAndStatus(userId, LeadStatus.LOST);

            double rate = assigned > 0 ? (double) converted / assigned * 100.0 : 0.0;
            rate = Math.round(rate * 10.0) / 10.0;

            performanceList.add(new SalesUserPerformanceDTO(
                    userId,
                    salesUser.getName(),
                    salesUser.getEmail(),
                    assigned,
                    converted,
                    lost,
                    rate
            ));
        }

        // Sort performance by assigned leads descending
        performanceList.sort((a, b) -> Long.compare(b.getAssignedLeads(), a.getAssignedLeads()));

        return performanceList;
    }

    @Override
    public FollowUpAnalyticsDTO getFollowUpAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        long total = followUpsRepository.count();
        long upcoming = followUpsRepository.countByNextFollowUpDateGreaterThanEqual(now);
        long overdue = followUpsRepository.countByNextFollowUpDateLessThan(now);
        long completed = followUpsRepository.countByNextFollowUpDateIsNull();

        return new FollowUpAnalyticsDTO(total, upcoming, overdue, completed);
    }

    @Override
    public FullAnalyticsReportDTO getFullReport() {
        return new FullAnalyticsReportDTO(
                getOverview(),
                getLeadsByStatus(),
                getSalesPerformance(),
                getFollowUpAnalytics()
        );
    }
}
