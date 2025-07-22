// app/service/ReportService.java
package app.service;

import app.model.Punch;
import app.repository.PunchRepository; // New import for Spring Data JPA PunchRepository
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // For transaction management

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@Transactional(readOnly = true) // Apply @Transactional for read-only operations for performance
public class ReportService {

    private final PunchRepository punchRepository; // Changed to PunchRepository

    // Spring will automatically inject the repository instance
    public ReportService(PunchRepository punchRepository) {
        this.punchRepository = punchRepository;
    }

    /**
     * Calculates the total working hours for a given employee for today.
     * @param employeeId The ID of the employee.
     * @return Total hours worked today.
     */
    public double getTodaysHours(Long employeeId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX); // End of day (23:59:59.999999999)

        // CORRECTED: Use the new Spring Data JPA method for finding punches within a range
        List<Punch> punches = punchRepository.findByEmployee_IdAndTimestampBetween(employeeId, startOfDay, endOfDay);
        return calculateTotalHours(punches);
    }

    /**
     * Calculates the total working hours for a given employee for the current week (Monday to Sunday).
     * @param employeeId The ID of the employee.
     * @return Total hours worked this week.
     */
    public double getWeeklyHours(Long employeeId) {
        LocalDate today = LocalDate.now();
        // Start of the current week (Monday)
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        // End of the current week (Sunday)
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        LocalDateTime startOfWeekDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endOfWeekDateTime = endOfWeek.atTime(LocalTime.MAX);

        // CORRECTED: Use the new Spring Data JPA method for finding punches within a range
        List<Punch> punches = punchRepository.findByEmployee_IdAndTimestampBetween(employeeId, startOfWeekDateTime, endOfWeekDateTime);
        return calculateTotalHours(punches);
    }

    /**
     * Helper method to calculate total hours from a sorted list of punches.
     * Assumes punches are sorted by timestamp and come in IN/OUT pairs.
     * Any unmatched "IN" punches at the end of the list are ignored for calculation.
     * @param punches A list of Punch objects for a specific period, sorted by timestamp.
     * @return The total hours worked.
     */
    private double calculateTotalHours(List<Punch> punches) {
        double totalHours = 0.0;
        LocalDateTime lastPunchIn = null;

        for (Punch punch : punches) {
            if ("IN".equalsIgnoreCase(punch.getPunchType())) {
                lastPunchIn = punch.getTimestamp();
            } else if ("OUT".equalsIgnoreCase(punch.getPunchType())) {
                if (lastPunchIn != null) {
                    long minutes = java.time.Duration.between(lastPunchIn, punch.getTimestamp()).toMinutes();
                    totalHours += (double) minutes / 60.0;
                    lastPunchIn = null; // Reset for the next IN/OUT pair
                }
            }
        }
        return totalHours;
    }
}