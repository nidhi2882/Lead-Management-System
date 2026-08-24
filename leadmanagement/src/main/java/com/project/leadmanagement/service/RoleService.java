package com.project.leadmanagement.service;

import java.util.List;
import com.project.leadmanagement.entity.Role;

public interface RoleService {

    Role createRole(Role role);

    List<Role> findAll();

    Role findById(int id);

    Role findByName(String name);

    void deleteById(int id);
}