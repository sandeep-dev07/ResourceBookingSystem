package com.bookslot.controller;

import com.bookslot.dto.MaintenanceRequest;
import com.bookslot.dto.MaintenanceResponse;
import com.bookslot.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping("/schedule")
    public ResponseEntity<MaintenanceResponse> scheduleMaintenance(@Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.scheduleMaintenance(request));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<MaintenanceResponse>> getAllActiveMaintenance() {
        return ResponseEntity.ok(maintenanceService.getAllActiveMaintenance());
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<MaintenanceResponse>> getMaintenanceByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceByResource(resourceId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/resource/{resourceId}/date")
    public ResponseEntity<List<MaintenanceResponse>> getMaintenanceByResourceAndDate(
            @PathVariable Long resourceId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceByResourceAndDate(resourceId, date));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{maintenanceId}/cancel")
    public ResponseEntity<Void> cancelMaintenance(@PathVariable Long maintenanceId) {
        maintenanceService.cancelMaintenance(maintenanceId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{maintenanceId}/complete")
    public ResponseEntity<Void> completeMaintenance(@PathVariable Long maintenanceId) {
        maintenanceService.completeMaintenance(maintenanceId);
        return ResponseEntity.noContent().build();
    }
}
