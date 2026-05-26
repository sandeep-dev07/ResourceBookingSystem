package com.bookslot.config;

import com.bookslot.entity.Resource;
import com.bookslot.entity.User;
import com.bookslot.repository.ResourceRepository;
import com.bookslot.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public DataSeeder(ResourceRepository resourceRepository, UserRepository userRepository) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (resourceRepository.count() == 0) {
            List<Resource> defaultResources = Arrays.asList(
                    new Resource("Conference Room A", 20, "Floor 3, East Wing", true, true, true,
                            "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80"),
                    new Resource("Conference Room B", 14, "Floor 2, North Wing", true, true, true,
                            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"),
                    new Resource("Training Hall", 40, "Floor 4, Center Block", true, true, true,
                            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"),
                    new Resource("AI Lab", 12, "Floor 5, Innovation Hub", true, true, true,
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"),
                    new Resource("Presentation Room", 16, "Floor 1, Lobby Annex", true, true, true,
                            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80"),
                    new Resource("Discussion Cabin", 8, "Floor 2, Quiet Corner", false, true, true,
                            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80")
            );

            resourceRepository.saveAll(defaultResources);
        }

        if (userRepository.count() == 0) {
            userRepository.save(new User("System Admin", "admin@example.com", "Admin@123", "Admin"));
        }
    }
}
