package app.service;

// Removed: import app.dao.EmployeeDAO;
// Removed: import app.dao.PunchDAO;
import app.model.Employee;
import app.model.Punch;
import app.dto.PunchRecordDto;
import app.repository.EmployeeRepository; // New import for Spring Data JPA EmployeeRepository
import app.repository.PunchRepository;    // New import for Spring Data JPA PunchRepository
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // For transaction management

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional // All public methods in this service will be transactional
public class PunchService {

    private final PunchRepository punchRepository;    // Injected Spring Data JPA repository
    private final EmployeeRepository employeeRepository; // Injected Spring Data JPA repository

    // Spring will automatically inject the repository instances
    public PunchService(PunchRepository punchRepository, EmployeeRepository employeeRepository) {
        this.punchRepository = punchRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<PunchRecordDto> findAllPunchesSortedDesc() {
        return punchRepository.findAllByOrderByTimestampDesc().stream()
                .map(punch -> new PunchRecordDto(
                        punch.getId(),
                        punch.getEmployee().getId(), // Get employeeId from associated Employee
                        punch.getPunchType(),
                        punch.getTimestamp()
                ))
                .collect(Collectors.toList());
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
     */
    public Punch recordPunch(Long employeeId, String punchType) { // Changed employeeId to Long
        // 1. Validate employee existence using EmployeeRepository
        Optional<Employee> optionalEmployee = employeeRepository.findById(employeeId);
        if (optionalEmployee.isEmpty()) {
            throw new IllegalArgumentException("Employee with ID " + employeeId + " not found.");
        }
        Employee employee = optionalEmployee.get(); // Get the managed Employee entity

        // 2. Check current clock-in status to prevent invalid consecutive punches
        // Using findTopBy... for the last punch, which returns an Optional
        // CORRECTED: Use findTopByEmployee_IdOrderByTimestampDesc
        Optional<Punch> lastPunchOptional = punchRepository.findTopByEmployee_IdOrderByTimestampDesc(employeeId);
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
        // IMPORTANT: Create Punch with the Employee object, not just employeeId
        Punch newPunch = new Punch(employee, punchType, LocalDateTime.now());
        Punch savedPunch = punchRepository.save(newPunch); // Use PunchRepository's save()

        System.out.println("Recorded punch: " + savedPunch);
        return savedPunch;
    }

    /**
     * Retrieves all punches for a given employee.
     *
     * @param employeeId The ID of the employee.
     * @return A list of Punch objects for the employee, sorted by timestamp (ascending by default, or as per repository method).
     */
    public List<Punch> getPunchesForEmployee(Long employeeId) { // Changed employeeId to Long
        return punchRepository.findByEmployee_Id(employeeId);
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
     */
    public double calculateTotalHoursWorked(Long employeeId, LocalDateTime start, LocalDateTime end) { // Changed employeeId to Long
        // Use the new Spring Data JPA method for finding punches within a range
        // CORRECTED: Use findByEmployee_IdAndTimestampBetween
        List<Punch> punches = punchRepository.findByEmployee_IdAndTimestampBetween(employeeId, start, end);
        double totalHours = 0.0;
        LocalDateTime lastInTime = null;

        for (Punch punch : punches) {
            if ("IN".equals(punch.getPunchType())) {
                lastInTime = punch.getTimestamp();
            } else if ("OUT".equals(punch.getPunchType()) && lastInTime != null) {
                long minutes = java.time.Duration.between(lastInTime, punch.getTimestamp()).toMinutes();
                totalHours += minutes / 60.0;
                lastInTime = null; // Reset for the next IN/OUT pair
            }
        }
        return totalHours;
    }

    /**
     * Deletes a punch record from the database.
     *
     * @param id The ID of the punch to delete.
     * @return true if the deletion was successful, false otherwise.
     */
    public boolean deletePunch(Long id) {
        if (punchRepository.existsById(id)) {
            punchRepository.deleteById(id);
            return true;
        }
        return false;
    }
}