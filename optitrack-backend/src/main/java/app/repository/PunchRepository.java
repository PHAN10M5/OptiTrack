package app.repository; // Or app.dao

import app.model.Punch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // Added for findTopBy...

@Repository // Marks this as a Spring Data JPA repository
public interface PunchRepository extends JpaRepository<Punch, Long> {
    // JpaRepository provides standard CRUD methods like: save(), findById(), findAll(), deleteById(), count()

    // Custom query methods, automatically implemented by Spring Data JPA:

    // CORRECTED: Find all punches for a specific employee by their associated Employee object's ID
    List<Punch> findByEmployee_Id(Long employeeId);

    // CORRECTED: Find all punches for a specific employee within a date range
    List<Punch> findByEmployee_IdAndTimestampBetween(Long employeeId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    // CORRECTED: Find the last (most recent) punch for a given employee
    // This leverages Spring Data JPA's derived query capabilities
    Optional<Punch> findTopByEmployee_IdOrderByTimestampDesc(Long employeeId);

    // In app.repository.PunchRepository.java
    List<Punch> findByTimestampBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // Optionally, if you need all punches sorted by timestamp descending for an employee
    List<Punch> findByEmployee_IdOrderByTimestampDesc(Long employeeId);

    List<Punch> findAllByOrderByTimestampDesc();
}