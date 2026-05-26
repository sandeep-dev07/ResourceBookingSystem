package com.bookslot.service;

import com.bookslot.dto.ResourceResponse;
import com.bookslot.entity.Booking;
import com.bookslot.entity.Resource;
import com.bookslot.repository.BookingRepository;
import com.bookslot.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, BookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getResources() {
        List<Resource> resources = resourceRepository.findAllByOrderByNameAsc();
        List<Booking> confirmedBookings = bookingRepository.findAllByStatusOrderByBookingDateAscStartTimeAsc("CONFIRMED");
        List<ResourceResponse> responses = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        for (Resource resource : resources) {
            ResourceResponse.NextBookingResponse nextBooking = null;
            String status = "AVAILABLE";

            for (Booking booking : confirmedBookings) {
                if (!booking.getResource().getId().equals(resource.getId())) {
                    continue;
                }

                boolean isFuture = booking.getBookingDate().isAfter(today)
                        || (booking.getBookingDate().isEqual(today) && booking.getEndTime().isAfter(currentTime));

                if (isFuture) {
                    status = "BOOKED";
                    if (nextBooking == null) {
                        nextBooking = new ResourceResponse.NextBookingResponse(
                                booking.getUser().getFullName(),
                                booking.getUser().getEmail(),
                                booking.getBookingDate(),
                                booking.getStartTime(),
                                booking.getEndTime(),
                                booking.getPurpose()
                        );
                    }
                }
            }

            responses.add(new ResourceResponse(
                    resource.getId(),
                    resource.getName(),
                    resource.getCapacity(),
                    resource.getLocation(),
                    resource.isProjector(),
                    resource.isWifi(),
                    resource.isAc(),
                    resource.getImageUrl(),
                    status,
                    nextBooking
            ));
        }

        return responses;
    }
}
