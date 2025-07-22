package app.service;

import app.dao.EmployeeDAO; // To validate employee existence
import app.dao.OvertimeRequestDAO;
import app.model.Employee;
import app.model.OvertimeRequest;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Spring Service component
public class OvertimeRequestService {
    private final OvertimeRequestDAO overtimeRequestDAO;
    private final EmployeeDAO employeeDAO; // To check if employee exists

    public OvertimeRequestService(OvertimeRequestDAO overtimeRequestDAO, EmployeeDAO employeeDAO) {
        this.overtimeRequestDAO = overtimeRequestDAO;
        this.employeeDAO = employeeDAO;
    }

    public OvertimeRequest createOvertimeRequest(long employeeId, LocalDateTime requestDateTime, double requestedHours, String reason) {
        try {
            // Validate employee existence
            Optional<Employee> employee = employeeDAO.findById(employeeId);
            if (employee.isEmpty()) {
                throw new IllegalArgumentException("Employee with ID " + employeeId + " not found.");
            }

            OvertimeRequest newRequest = new OvertimeRequest(employeeId, requestDateTime, requestedHours, reason);
            return overtimeRequestDAO.save(newRequest);
        } catch (SQLException e) {
            System.err.println("Error creating overtime request: " + e.getMessage());
            throw new RuntimeException("Failed to create overtime request.", e);
        }
    }

    public Optional<OvertimeRequest> getOvertimeRequestById(long id) {
        try {
            return overtimeRequestDAO.findById(id);
        } catch (SQLException e) {
            System.err.println("Error retrieving overtime request by ID: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve overtime request.", e);
        }
    }

    public List<OvertimeRequest> getOvertimeRequestsByEmployee(long employeeId) {
        try {
            return overtimeRequestDAO.findByEmployeeId(employeeId);
        } catch (SQLException e) {
            System.err.println("Error retrieving overtime requests for employee " + employeeId + ": " + e.getMessage());
            throw new RuntimeException("Failed to retrieve overtime requests.", e);
        }
    }

    public List<OvertimeRequest> getAllOvertimeRequests() {
        try {
            return overtimeRequestDAO.findAll();
        } catch (SQLException e) {
            System.err.println("Error retrieving all overtime requests: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve all overtime requests.", e);
        }
    }

    public OvertimeRequest updateOvertimeRequestStatus(long id, String newStatus) {
        try {
            Optional<OvertimeRequest> existingRequestOptional = overtimeRequestDAO.findById(id);
            if (existingRequestOptional.isEmpty()) {
                throw new IllegalArgumentException("Overtime request with ID " + id + " not found.");
            }
            OvertimeRequest request = existingRequestOptional.get();
            request.setStatus(newStatus); // Update the status
            overtimeRequestDAO.update(request); // Save changes to DB
            return request;
        } catch (SQLException e) {
            System.err.println("Error updating overtime request status: " + e.getMessage());
            throw new RuntimeException("Failed to update overtime request status.", e);
        }
    }

    public boolean deleteOvertimeRequest(long id) {
        try {
            return overtimeRequestDAO.delete(id);
        } catch (SQLException e) {
            System.err.println("Error deleting overtime request: " + e.getMessage());
            throw new RuntimeException("Failed to delete overtime request.", e);
        }
    }
}
