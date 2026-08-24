package com.project.leadmanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.project.leadmanagement.entity.Role;
import com.project.leadmanagement.exception.ResourceNotFoundException;
import com.project.leadmanagement.repository.RoleRepository;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Role findById(int id) {
        return roleRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Role findByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }

    @Override
    @Transactional
    public void deleteById(int id) {
        try {
            roleRepository.deleteById((long) id);
        } catch (EmptyResultDataAccessException ex) {
            throw new ResourceNotFoundException("Role not found");
        }
    }
}