package com.project.leadmanagement.service;

import java.util.List;
import com.project.leadmanagement.entity.FollowUps;


public interface FollowUpsService {

    FollowUps createFollowUp(FollowUps followUp);

    List<FollowUps> findAll();

    FollowUps findById(int id);

    List<FollowUps> getFollowUpsByLeadId(int leadId);

    void deleteById(int id);
}