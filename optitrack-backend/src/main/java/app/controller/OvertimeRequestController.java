package app.controller;

import app.model.OvertimeRequest;
import app.service.OvertimeRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/overtime-requests")
public class OvertimeRequestController {

    private final OvertimeRequestService overtimeRequestService;

    public OvertimeRequestController(OvertimeRequestService overtimeRequestService) {
        this.overtimeRequestService = overtimeRequestService;
    }

    @PostMapping // Handles POST to /api/overtime-requests
    @ResponseStatus(HttpStatus.CREATED)
    public OvertimeRequest createOvertimeRequest(@RequestBody OvertimeRequest request) {
        // The ID will be 0 initially and set by the DAO after saving
        return overtimeRequestService.createOvertimeRequest(
                request.getEmployeeId(),
                request.getRequestDateTime(),
                request.getRequestedHours(),
                request.getReason()
        );
    }

    @GetMapping // Handles GET to /api/overtime-requests
    public List<OvertimeRequest> getAllOvertimeRequests() {
        return overtimeRequestService.getAllOvertimeRequests();
    }

    @GetMapping("/{id}") // Handles GET to /api/overtime-requests/{id}
    public ResponseEntity<OvertimeRequest> getOvertimeRequestById(@PathVariable long id) {
        Optional<OvertimeRequest> request = overtimeRequestService.getOvertimeRequestById(id);
        return request.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}") // Handles GET to /api/overtime-requests/employee/{employeeId}
    public List<OvertimeRequest> getOvertimeRequestsByEmployee(@PathVariable long employeeId) {
        return overtimeRequestService.getOvertimeRequestsByEmployee(employeeId);
    }

    @PutMapping("/{id}/status") // Handles PUT to /api/overtime-requests/{id}/status
    public ResponseEntity<OvertimeRequest> updateOvertimeRequestStatus(
            @PathVariable long id,
            @RequestBody String newStatus) { // Expects "APPROVED", "REJECTED", etc.
        try {
            OvertimeRequest updatedRequest = overtimeRequestService.updateOvertimeRequestStatus(id, newStatus);
            return ResponseEntity.ok(updatedRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}") // Handles DELETE to /api/overtime-requests/{id}
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteOvertimeRequest(@PathVariable long id) {
        if (overtimeRequestService.deleteOvertimeRequest(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
