package com.bookslot.service;

import com.bookslot.dto.BookingRequest;
import com.bookslot.dto.BookingResponse;
import com.bookslot.entity.Booking;
import com.bookslot.entity.Resource;
import com.bookslot.entity.User;
import com.bookslot.repository.BookingRepository;
import com.bookslot.repository.ResourceRepository;
import com.bookslot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final MaintenanceService maintenanceService;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ResourceRepository resourceRepository,
                          MaintenanceService maintenanceService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.maintenanceService = maintenanceService;
    }

    @Transactional
    public BookingResponse bookRoom(BookingRequest request) {
        User user = userRepository.findByEmail(request.getUserEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Resource resource = resourceRepository.findById(Long.valueOf(request.getResourceId()))
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));

        validateBookingRequest(request);

        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("This resource is already booked for the selected time slot.");
        }

        // Check for maintenance conflicts
        if (maintenanceService.hasMaintenanceConflict(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime())) {
            throw new IllegalStateException("This resource is under maintenance during the selected time slot. Please choose a different time.");
        }

        Booking booking = new Booking(
                user,
                resource,
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose().trim()
        );

        Booking saved = bookingRepository.save(booking);

        return new BookingResponse(
                saved.getId(),
                user.getEmail(),
                user.getFullName(),
                resource.getId().toString(), 
                resource.getName(),
                saved.getBookingDate(),
                saved.getStartTime(),
                saved.getEndTime(),
                saved.getPurpose(),
                saved.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByStatusOrderByBookingDateAscStartTimeAsc("CONFIRMED");
        List<BookingResponse> responses = new ArrayList<>();

        for (Booking booking : bookings) {
            responses.add(new BookingResponse(
                    booking.getId(),
                    booking.getUser().getEmail(),
                    booking.getUser().getFullName(),
                    booking.getResource().getId().toString(),
                    booking.getResource().getName(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getPurpose(),
                    booking.getStatus()
            ));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        List<Booking> bookings = bookingRepository.findByUserIdAndStatusOrderByBookingDateAscStartTimeAsc(user.getId(), "CONFIRMED");
        List<BookingResponse> responses = new ArrayList<>();

        for (Booking booking : bookings) {
            responses.add(new BookingResponse(
                    booking.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    booking.getResource().getId().toString(),
                    booking.getResource().getName(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getPurpose(),
                    booking.getStatus()
            ));
        }

        return responses;
    }

    @Transactional
    public void cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        if (!booking.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("You are not allowed to cancel this booking.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    private void validateBookingRequest(BookingRequest request) {
        if (request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be later than start time.");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be later than start time.");
        }

        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("You cannot book a room in the past.");
        }
    }
}
