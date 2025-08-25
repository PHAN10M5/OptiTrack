package app.controller;

import app.model.Punch;
import app.service.PunchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException; // Import for parsing errors
import java.util.Collections; // For Collections.singletonMap
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/punches")
public class PunchController {

    private final PunchService punchService;

    public PunchController(PunchService punchService) {
        this.punchService = punchService;
    }

    // Handles POST requests to /api/punches/in
    @PostMapping("/in")
    public ResponseEntity<?> clockIn(@RequestBody Map<String, Long> payload) {
        try {
            long employeeId = payload.get("employeeId");
            Punch recordedPunch = punchService.recordPunch(employeeId, "IN");
            return new ResponseEntity<>(recordedPunch, HttpStatus.CREATED); // Return 201 Created
        } catch (IllegalArgumentException e) {
            // e.g., Employee not found, Invalid punch type
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (IllegalStateException e) {
            // e.g., Already clocked in
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict for business rule violation
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            // Catch any other unexpected server errors
            System.err.println("Server error during clock-in: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected server error occurred during clock-in."));
        }
    }

    // Handles POST requests to /api/punches/out
    @PostMapping("/out")
    public ResponseEntity<?> clockOut(@RequestBody Map<String, Long> payload) {
        try {
            long employeeId = payload.get("employeeId");
            Punch recordedPunch = punchService.recordPunch(employeeId, "OUT");
            return new ResponseEntity<>(recordedPunch, HttpStatus.CREATED); // Return 201 Created
        } catch (IllegalArgumentException e) {
            // e.g., Employee not found, Invalid punch type
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (IllegalStateException e) {
            // e.g., Not currently clocked in
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict for business rule violation
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            // Catch any other unexpected server errors
            System.err.println("Server error during clock-out: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected server error occurred during clock-out."));
        }
    }

    @GetMapping("/employee/{employeeId}") // Handles GET requests to /api/punches/employee/{employeeId}
    public ResponseEntity<?> getPunchesForEmployee(@PathVariable long employeeId) {
        try {
            List<Punch> punches = punchService.getPunchesForEmployee(employeeId);
            return ResponseEntity.ok(punches);
        } catch (Exception e) {
            System.err.println("Error fetching punches for employee " + employeeId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to retrieve punches for employee."));
        }
    }

    @GetMapping("/employee/{employeeId}/hours") // Handles GET requests to /api/punches/employee/{employeeId}/hours
    public ResponseEntity<?> calculateHoursWorked(
            @PathVariable long employeeId,
            @RequestParam String startTime, // Expects ISO format string from frontend
            @RequestParam String endTime) { // Expects ISO format string from frontend
        try {
            LocalDateTime start = LocalDateTime.parse(startTime);
            LocalDateTime end = LocalDateTime.parse(endTime);
            double hours = punchService.calculateTotalHoursWorked(employeeId, start, end);
            return ResponseEntity.ok(hours);
        } catch (DateTimeParseException e) { // Catch specific parsing error
            System.err.println("Error parsing date/time for hours calculation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid date format for start or end time."));
        } catch (Exception e) {
            System.err.println("Error calculating hours for employee " + employeeId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected error occurred during hours calculation."));
        }
    }
}