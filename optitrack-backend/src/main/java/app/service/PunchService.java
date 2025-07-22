package app.service;


import app.dao.EmployeeDAO; // Changed import
import app.dao.PunchDAO; // Changed import
import app.model.Employee; // Changed import
import app.model.Punch; // Changed import
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PunchService {
    private final PunchDAO punchDAO;
    private final EmployeeDAO employeeDAO; // Needed to check employee existence

    public PunchService(PunchDAO punchDAO, EmployeeDAO employeeDAO) {
        this.punchDAO = punchDAO;
        this.employeeDAO = employeeDAO;
    }

    /**
     * Records a clock-in or clock-out punch for an employee.
     * This method handles the business logic of punching.
     *
     * @param employeeId The ID of the employee performing the punch.
     * @param punchType "IN" for clock-in, "OUT" for clock-out.
     * @return The created Punch object.
     * @throws IllegalArgumentException if employee does not exist or punch type is invalid.
     * @throws IllegalStateException if the employee is already clocked in/out inappropriately.
     * @throws RuntimeException if a database error occurs.
     */
    public Punch recordPunch(long employeeId, String punchType) {
        try {
            // 1. Validate employee existence
            Optional<Employee> optionalEmployee = employeeDAO.findById(employeeId);
            if (optionalEmployee.isEmpty()) {
                throw new IllegalArgumentException("Employee with ID " + employeeId + " not found.");
            }
            Employee employee = optionalEmployee.get();

            // 2. Check current clock-in status to prevent invalid consecutive punches
            Optional<Punch> lastPunchOptional = punchDAO.findLastPunchByEmployeeId(employeeId);
            boolean isCurrentlyClockedIn = lastPunchOptional.isPresent() && "IN".equals(lastPunchOptional.get().getPunchType());

            if ("IN".equals(punchType)) {
                if (isCurrentlyClockedIn) {
                    throw new IllegalStateException("Employee " + employee.getFullName() + " is already clocked IN.");
                }
            } else if ("OUT".equals(punchType)) {
                if (!isCurrentlyClockedIn) {
                    throw new IllegalStateException("Employee " + employee.getFullName() + " is not currently clocked IN.");
                }
            } else {
                throw new IllegalArgumentException("Invalid punch type: " + punchType + ". Must be 'IN' or 'OUT'.");
            }

            // 3. Create and save the new punch
            Punch newPunch = new Punch(employeeId, punchType, LocalDateTime.now());
            Punch savedPunch = punchDAO.save(newPunch);

            // Optionally, add the punch to the in-memory employee object if you're keeping it updated
            // employee.addPunch(savedPunch); // This would require fetching the full employee object and its punches

            System.out.println("Recorded punch: " + savedPunch);
            return savedPunch;

        } catch (SQLException e) {
            System.err.println("Error recording punch: " + e.getMessage());
            throw new RuntimeException("Failed to record punch.", e);
        }
    }

    /**
     * Retrieves all punches for a given employee.
     *
     * @param employeeId The ID of the employee.
     * @return A list of Punch objects for the employee, sorted by timestamp.
     * @throws RuntimeException if a database error occurs.
     */
    public List<Punch> getPunchesForEmployee(long employeeId) {
        try {
            return punchDAO.findByEmployeeId(employeeId);
        } catch (SQLException e) {
            System.err.println("Error retrieving punches for employee " + employeeId + ": " + e.getMessage());
            throw new RuntimeException("Failed to retrieve punches.", e);
        }
    }

    /**
     * Calculates the total hours worked for an employee within a given time range.
     * This is a simplified calculation and does not account for overnight shifts,
     * breaks, or complex scheduling rules.
     *
     * @param employeeId The ID of the employee.
     * @param start The start of the time range (inclusive).
     * @param end The end of the time range (inclusive).
     * @return The total hours worked as a double.
     * @throws RuntimeException if a database error occurs.
     */
    public double calculateTotalHoursWorked(long employeeId, LocalDateTime start, LocalDateTime end) {
        List<Punch> punches = getPunchesForEmployee(employeeId);
        double totalHours = 0.0;
        LocalDateTime lastInTime = null;

        for (Punch punch : punches) {
            // Only consider punches within the specified range
            if (punch.getTimestamp().isAfter(end) || punch.getTimestamp().isBefore(start)) {
                continue;
            }

            if ("IN".equals(punch.getPunchType())) {
                lastInTime = punch.getTimestamp();
            } else if ("OUT".equals(punch.getPunchType()) && lastInTime != null) {
                // Calculate duration between IN and OUT
                long minutes = java.time.Duration.between(lastInTime, punch.getTimestamp()).toMinutes();
                totalHours += minutes / 60.0;
                lastInTime = null; // Reset for the next IN/OUT pair
            }
        }
        return totalHours;
    }
}
