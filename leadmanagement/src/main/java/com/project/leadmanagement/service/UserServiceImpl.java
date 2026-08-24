package com.project.leadmanagement.service;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;


import com.project.leadmanagement.entity.Role;
import com.project.leadmanagement.entity.Users;
import com.project.leadmanagement.exception.ResourceNotFoundException;
import com.project.leadmanagement.repository.RoleRepository;
import com.project.leadmanagement.repository.UserRepository;
@Service
public class UserServiceImpl implements UsersService{
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	@Autowired
	public UserServiceImpl(UserRepository userRepository,RoleRepository roleRepository)
	{
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
	}
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Transactional
	@Override
	public Users createUser(Users user) {
	    user.setPassword(passwordEncoder.encode(user.getPassword())); // MUST
	    return userRepository.save(user);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Users> findAll() {
		return userRepository.findAll();
	}

	@Override
	@Transactional(readOnly = true)
	public Users findById(int id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	@Override
	public Users updateUser(Users user, int id) {
		 Users existing = userRepository.findById(id)
				 .orElseThrow(() -> new ResourceNotFoundException("User not found"));

	     existing.setName(user.getName());
	     existing.setEmail(user.getEmail());
	     existing.setAssignedRole(user.getAssignedRole());

	     return userRepository.save(existing);
	}

	@Override
	@Transactional
	public void deleteById(int id) {
		try {
			userRepository.deleteById(id);
		} catch (EmptyResultDataAccessException ex) {
			throw new ResourceNotFoundException("User not found");
		}
	}
	@Transactional
	public Users assignRole(int userId, int roleId) {
	    Users user = userRepository.findById(userId)
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

	    Role role = roleRepository.findById((long) roleId)
	            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

	    user.setAssignedRole(role);
	    return userRepository.save(user);
	}
	
	@Override
	public Users findByEmail(String email) {
	    return userRepository.findByEmail(email)
	            .orElse(null);
	}

	 @Override
	 public void save(Users user) {
		 userRepository.save(user);
		
	 }

	 @Override
	 public Role getRoleById(Long roleId) {
		 return roleRepository.findById(roleId)
		            .orElseThrow(() -> new RuntimeException("Role not found"));
	 }
}
