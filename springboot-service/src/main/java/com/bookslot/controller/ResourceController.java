package com.bookslot.controller;

import com.bookslot.dto.ResourceResponse;
import com.bookslot.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/resources")
    public ResponseEntity<List<ResourceResponse>> getResources() {
        return ResponseEntity.ok(resourceService.getResources());
    }
}
