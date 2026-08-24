package com.project.leadmanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.project.leadmanagement.entity.FollowUps;
import com.project.leadmanagement.exception.ResourceNotFoundException;
import com.project.leadmanagement.repository.FollowUpsRepository;

@Service
public class FollowUpsServiceImpl implements FollowUpsService {

    private final FollowUpsRepository followUpsRepository;

    @Autowired
    public FollowUpsServiceImpl(FollowUpsRepository followUpsRepository) {
        this.followUpsRepository = followUpsRepository;
    }
    
    @Override
    @Transactional
    public FollowUps createFollowUp(FollowUps followUps) {
        return followUpsRepository.save(followUps);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUps> findAll() {
        return followUpsRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public FollowUps findById(int id) {
        return followUpsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUps> getFollowUpsByLeadId(int leadId) {
        return followUpsRepository.findByLeadId(leadId);
    }

    @Override
    @Transactional
    public void deleteById(int id) {
        try {
            followUpsRepository.deleteById(id);
        } catch (EmptyResultDataAccessException ex) {
            throw new ResourceNotFoundException("Follow-up not found");
        }
    }
}