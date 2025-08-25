package app.service;

import app.exception.ResourceNotFoundException;
import app.model.Employee;
import app.model.OvertimeRequest;
import app.payload.request.OvertimeRequestDTO;
import app.repository.EmployeeRepository;
import app.repository.OvertimeRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OvertimeRequestService {

    private final OvertimeRequestRepository overtimeRequestRepository;
    private final EmployeeRepository employeeRepository;

    public OvertimeRequestService(OvertimeRequestRepository overtimeRequestRepository, EmployeeRepository employeeRepository) {
        this.overtimeRequestRepository = overtimeRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    // --- NEW METHODS FOR THE REST API ENDPOINTS ---

    /**
     * Submits a new overtime request from the employee dashboard.
     * This method is designed to be used with a DTO from a REST API endpoint.
     *
     * @param employeeId The ID of the authenticated employee.
     * @param requestDTO The DTO containing the request details.
     * @return The newly created OvertimeRequest object.
     */
    @Transactional
    public OvertimeRequest submitRequest(Long employeeId, OvertimeRequestDTO requestDTO) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        OvertimeRequest newRequest = new OvertimeRequest(
                employee,
                LocalDateTime.now(),
                requestDTO.getOvertimeDate(),
                requestDTO.getRequestedHours(),
                requestDTO.getReason()
        );

        return overtimeRequestRepository.save(newRequest);
    }

    /**
     * Retrieves all pending overtime requests for a specific employee.
     * @param employeeId The ID of the employee.
     * @return A list of pending OvertimeRequest objects.
     */
    @Transactional(readOnly = true)
    public List<OvertimeRequest> getPendingRequestsForEmployee(Long employeeId) {
        return overtimeRequestRepository.findByEmployee_IdAndStatus(employeeId, "PENDING");
    }

    /**
     * Retrieves all approved overtime requests for a specific employee.
     * @param employeeId The ID of the employee.
     * @return A list of approved OvertimeRequest objects.
     */
    @Transactional(readOnly = true)
    public List<OvertimeRequest> getApprovedRequestsForEmployee(Long employeeId) {
        return overtimeRequestRepository.findByEmployee_IdAndStatus(employeeId, "APPROVED");
    }

    /**
     * Retrieves all pending overtime requests for all employees (for Admin view).
     * @return A list of all pending OvertimeRequest objects.
     */
    @Transactional(readOnly = true)
    public List<OvertimeRequest> getAllPendingRequests() {
        return overtimeRequestRepository.findByStatus("PENDING");
    }

    /**
     * Approves an overtime request by its ID.
     * @param requestId The ID of the request to approve.
     * @return The approved OvertimeRequest object.
     * @throws ResourceNotFoundException if the request is not found.
     * @throws IllegalStateException if the request is not in a PENDING status.
     */
    @Transactional
    public OvertimeRequest approveRequest(Long requestId) {
        OvertimeRequest request = overtimeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime Request not found with ID: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Only pending requests can be approved.");
        }

        request.setStatus("APPROVED");
        return overtimeRequestRepository.save(request);
    }

    /**
     * Rejects an overtime request by its ID.
     * @param requestId The ID of the request to reject.
     * @return The rejected OvertimeRequest object.
     * @throws ResourceNotFoundException if the request is not found.
     * @throws IllegalStateException if the request is not in a PENDING status.
     */
    @Transactional
    public OvertimeRequest rejectRequest(Long requestId) {
        OvertimeRequest request = overtimeRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime Request not found with ID: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Only pending requests can be rejected.");
        }

        request.setStatus("REJECTED");
        return overtimeRequestRepository.save(request);
    }
}