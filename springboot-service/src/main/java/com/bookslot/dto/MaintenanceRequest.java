package com.bookslot.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class MaintenanceRequest {
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Maintenance date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate maintenanceDate;
    
    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @NotBlank(message = "Maintenance type is required")
    private String type;
    
    private String createdBy;

    public MaintenanceRequest() {
    }

    public MaintenanceRequest(Long resourceId, String description, LocalDate maintenanceDate,
                            LocalTime startTime, LocalTime endTime, String type, String createdBy) {
        this.resourceId = resourceId;
        this.description = description;
        this.maintenanceDate = maintenanceDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.createdBy = createdBy;
    }

    // Getters and Setters
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
