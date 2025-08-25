package app.controller;

import app.exception.ResourceNotFoundException;
import app.model.OvertimeRequest;
import app.model.User;
import app.payload.request.OvertimeRequestDTO;
import app.payload.response.OvertimeRequestResponse;
import app.service.OvertimeRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/overtime") // Changed from /api/overtime-requests for cleaner URLs
public class OvertimeRequestController {

    private final OvertimeRequestService overtimeRequestService;

    public OvertimeRequestController(OvertimeRequestService overtimeRequestService) {
        this.overtimeRequestService = overtimeRequestService;
    }

    // Helper method to get the authenticated employee's ID
    private Long getAuthenticatedEmployeeId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated.");
        }

        Object principal = authentication.getPrincipal();

        // Check if the principal is a User instance and not a generic String
        if (principal instanceof User) {
            return ((User) principal).getEmployeeId();
        }

        // This part handles other valid principal types, like UserDetails
        if (principal instanceof UserDetails) {
            // You might need to cast to your custom User class if it's stored this way
            if (principal instanceof User) {
                return ((User) principal).getEmployeeId();
            }
        }

        // This is the fallback if the principal is not of the expected type
        throw new IllegalStateException("Could not determine employee ID from authentication.");
    }

    //------------------------------------------------------------------------------------------------------------------
    // ENDPOINTS FOR EMPLOYEES
    //------------------------------------------------------------------------------------------------------------------

    @PostMapping("/request")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> submitRequest(@RequestBody OvertimeRequestDTO requestDTO) {
        try {
            Long employeeId = getAuthenticatedEmployeeId();
            if (employeeId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Could not determine employee ID from authentication."));
            }
            OvertimeRequest newRequest = overtimeRequestService.submitRequest(employeeId, requestDTO);
            return new ResponseEntity<>(newRequest, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/employee/pending")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<OvertimeRequestResponse>> getEmployeePendingRequests() {
        Long employeeId = getAuthenticatedEmployeeId();
        if (employeeId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<OvertimeRequest> pendingRequests = overtimeRequestService.getPendingRequestsForEmployee(employeeId);
        List<OvertimeRequestResponse> responseList = pendingRequests.stream()
                .map(OvertimeRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/employee/approved")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<OvertimeRequestResponse>> getEmployeeApprovedRequests() {
        Long employeeId = getAuthenticatedEmployeeId();
        if (employeeId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<OvertimeRequest> approvedRequests = overtimeRequestService.getApprovedRequestsForEmployee(employeeId);
        List<OvertimeRequestResponse> responseList = approvedRequests.stream()
                .map(OvertimeRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    //------------------------------------------------------------------------------------------------------------------
    // ENDPOINTS FOR ADMINS
    //------------------------------------------------------------------------------------------------------------------

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OvertimeRequestResponse>> getAllPendingRequests() {
        List<OvertimeRequest> pendingRequests = overtimeRequestService.getAllPendingRequests();
        List<OvertimeRequestResponse> responseList = pendingRequests.stream()
                .map(OvertimeRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/admin/approve/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        try {
            OvertimeRequest approvedRequest = overtimeRequestService.approveRequest(requestId);
            return ResponseEntity.ok(approvedRequest);
        } catch (ResourceNotFoundException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/reject/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        try {
            OvertimeRequest rejectedRequest = overtimeRequestService.rejectRequest(requestId);
            return ResponseEntity.ok(rejectedRequest);
        } catch (ResourceNotFoundException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}