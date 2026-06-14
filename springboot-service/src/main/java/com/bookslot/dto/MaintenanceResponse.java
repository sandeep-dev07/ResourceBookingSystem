package com.bookslot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class MaintenanceResponse {
    private Long id;
    private String resourceName;
    private Long resourceId;
    private String description;
    private LocalDate maintenanceDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String type;
    private String status;
    private String createdBy;

    public MaintenanceResponse() {
    }

    public MaintenanceResponse(Long id, String resourceName, Long resourceId, String description,
                             LocalDate maintenanceDate, LocalTime startTime, LocalTime endTime,
                             String type, String status, String createdBy) {
        this.id = id;
        this.resourceName = resourceName;
        this.resourceId = resourceId;
        this.description = description;
        this.maintenanceDate = maintenanceDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.status = status;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
