package com.bookslot.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;

public class ResourceResponse {

    private Long id;
    private String name;
    private Integer capacity;
    private String location;
    private boolean projector;
    private boolean wifi;
    private boolean ac;
    private String imageUrl;
    private String status;
    private NextBookingResponse nextBooking;

    public static class NextBookingResponse {
        private String userName;
        private String userEmail;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;

        private String purpose;

        public NextBookingResponse() {
        }

        public NextBookingResponse(String userName, String userEmail, LocalDate date, LocalTime startTime, LocalTime endTime, String purpose) {
            this.userName = userName;
            this.userEmail = userEmail;
            this.date = date;
            this.startTime = startTime;
            this.endTime = endTime;
            this.purpose = purpose;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getUserEmail() {
            return userEmail;
        }

        public void setUserEmail(String userEmail) {
            this.userEmail = userEmail;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
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

        public String getPurpose() {
            return purpose;
        }

        public void setPurpose(String purpose) {
            this.purpose = purpose;
        }
    }

    public ResourceResponse() {
    }

    public ResourceResponse(Long id, String name, Integer capacity, String location, boolean projector, boolean wifi, boolean ac, String imageUrl, String status, NextBookingResponse nextBooking) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.location = location;
        this.projector = projector;
        this.wifi = wifi;
        this.ac = ac;
        this.imageUrl = imageUrl;
        this.status = status;
        this.nextBooking = nextBooking;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isProjector() {
        return projector;
    }

    public void setProjector(boolean projector) {
        this.projector = projector;
    }

    public boolean isWifi() {
        return wifi;
    }

    public void setWifi(boolean wifi) {
        this.wifi = wifi;
    }

    public boolean isAc() {
        return ac;
    }

    public void setAc(boolean ac) {
        this.ac = ac;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public NextBookingResponse getNextBooking() {
        return nextBooking;
    }

    public void setNextBooking(NextBookingResponse nextBooking) {
        this.nextBooking = nextBooking;
    }
}
