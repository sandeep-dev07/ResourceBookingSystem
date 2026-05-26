package com.bookslot.repository;

import com.bookslot.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdAndStatusOrderByBookingDateAscStartTimeAsc(Long userId, String status);

    List<Booking> findAllByStatusOrderByBookingDateAscStartTimeAsc(String status);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.bookingDate = :bookingDate AND b.status = 'CONFIRMED' AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId,
                                          @Param("bookingDate") LocalDate bookingDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime);
}
