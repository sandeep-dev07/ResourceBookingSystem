 package com.bookslot.service;

import com.bookslot.dto.AuthResponse;
import com.bookslot.security.JwtUtil;
import com.bookslot.dto.LoginRequest;
import com.bookslot.dto.RegisterRequest;
import com.bookslot.entity.User;
import com.bookslot.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER USER
    public AuthResponse register(RegisterRequest request) {

        // Check password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Create user
        User user = new User(
                request.getFullName(),
                request.getEmail().toLowerCase(),
                request.getPassword(),
                request.getRole()
        ); 

        // Store normal password directly
        user.setPasswordHash(request.getPassword());

        // Save user
        User saved = userRepository.save(user);

        // Return response
        return new AuthResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole()
        );
    }

    // LOGIN USER
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        // Compare plain passwords
        if (!request.getPassword().equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials.");
        }

        // Generate JWT token
        String token = JwtUtil.generateToken(user.getEmail());

        // Build response
        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );

        response.setToken(token);

        return response;
    }}