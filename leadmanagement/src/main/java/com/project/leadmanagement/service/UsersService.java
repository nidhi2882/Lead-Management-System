package com.project.leadmanagement.service;

import java.util.List;

import com.project.leadmanagement.entity.Role;
import com.project.leadmanagement.entity.Users;

public interface UsersService {
	Users createUser(Users user);
	List <Users> findAll();
	Users findById(int id);
	Users updateUser(Users user,int id);
	void deleteById(int id);
	Users findByEmail(String email);
	void save(Users user);
	Role getRoleById(Long roleId);
}
