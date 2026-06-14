package com.bookslot.service;

import com.bookslot.dto.MaintenanceRequest;
import com.bookslot.dto.MaintenanceResponse;
import com.bookslot.entity.Maintenance;
import com.bookslot.entity.Resource;
import com.bookslot.repository.MaintenanceRepository;
import com.bookslot.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;
    
    @Autowired
    private ResourceRepository resourceRepository;

    public MaintenanceService() {
    }

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                            ResourceRepository resourceRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public MaintenanceResponse scheduleMaintenance(MaintenanceRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));

        validateMaintenanceRequest(request);

        Maintenance maintenance = new Maintenance(
                resource,
                request.getDescription(),
                request.getMaintenanceDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getType() != null ? request.getType() : "SCHEDULED",
                request.getCreatedBy()
        );

        Maintenance saved = maintenanceRepository.save(maintenance);

        return convertToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getAllActiveMaintenance() {
        List<Maintenance> maintenances = maintenanceRepository.findByStatusOrderByMaintenanceDateAscStartTimeAsc("ACTIVE");
        List<MaintenanceResponse> responses = new ArrayList<>();

        for (Maintenance maintenance : maintenances) {
            responses.add(convertToResponse(maintenance));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByResource(Long resourceId) {
        List<Maintenance> maintenances = maintenanceRepository.findByResourceIdOrderByMaintenanceDateAscStartTimeAsc(resourceId);
        List<MaintenanceResponse> responses = new ArrayList<>();

        for (Maintenance maintenance : maintenances) {
            responses.add(convertToResponse(maintenance));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByResourceAndDate(Long resourceId, LocalDate date) {
        List<Maintenance> maintenances = maintenanceRepository.findMaintenanceByResourceAndDate(resourceId, date);
        List<MaintenanceResponse> responses = new ArrayList<>();

        for (Maintenance maintenance : maintenances) {
            responses.add(convertToResponse(maintenance));
        }

        return responses;
    }

    @Transactional
    public void cancelMaintenance(Long maintenanceId) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found."));

        maintenance.setStatus("CANCELLED");
        maintenanceRepository.save(maintenance);
    }

    @Transactional
    public void completeMaintenance(Long maintenanceId) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found."));

        maintenance.setStatus("COMPLETED");
        maintenanceRepository.save(maintenance);
    }

    public boolean hasMaintenanceConflict(Long resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        List<Maintenance> maintenances = maintenanceRepository.findMaintenanceByResourceAndDate(resourceId, bookingDate);
        
        for (Maintenance m : maintenances) {
            // Check if booking time overlaps with maintenance window
            // Overlap occurs if: booking starts before maintenance ends AND booking ends after maintenance starts
            if (startTime.isBefore(m.getEndTime()) && endTime.isAfter(m.getStartTime())) {
                return true; // Conflict found
            }
        }
        
        return false; // No conflict
    }

    private void validateMaintenanceRequest(MaintenanceRequest request) {
        if (request.getMaintenanceDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Maintenance date cannot be in the past.");
        }

        if (request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be later than start time.");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be later than start time.");
        }

        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Maintenance description is required.");
        }
    }

    private MaintenanceResponse convertToResponse(Maintenance maintenance) {
        return new MaintenanceResponse(
                maintenance.getId(),
                maintenance.getResource().getName(),
                maintenance.getResource().getId(),
                maintenance.getDescription(),
                maintenance.getMaintenanceDate(),
                maintenance.getStartTime(),
                maintenance.getEndTime(),
                maintenance.getType(),
                maintenance.getStatus(),
                maintenance.getCreatedBy()
        );
    }
}
