package com.bookslot.repository;

import com.bookslot.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByResourceIdOrderByMaintenanceDateAscStartTimeAsc(Long resourceId);

    List<Maintenance> findByStatusOrderByMaintenanceDateAscStartTimeAsc(String status);

    @Query("SELECT m FROM Maintenance m WHERE m.resource.id = :resourceId AND m.maintenanceDate = :date AND m.status = 'ACTIVE'")
    List<Maintenance> findMaintenanceByResourceAndDate(@Param("resourceId") Long resourceId, @Param("date") LocalDate date);

    @Query("SELECT m FROM Maintenance m WHERE m.maintenanceDate >= :fromDate AND m.maintenanceDate <= :toDate AND m.status = 'ACTIVE'")
    List<Maintenance> findMaintenanceInDateRange(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}
