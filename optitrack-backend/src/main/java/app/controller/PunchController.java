package app.controller;

import app.model.Punch;
import app.service.PunchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/punches")
public class PunchController {

    private final PunchService punchService;

    public PunchController(PunchService punchService) {
        this.punchService = punchService;
    }

    @PostMapping("/in") // Handles POST requests to /api/punches/in
    @ResponseStatus(HttpStatus.CREATED)
    public Punch clockIn(@RequestBody Map<String, Long> payload) {
        long employeeId = payload.get("employeeId");
        return punchService.recordPunch(employeeId, "IN");
    }

    @PostMapping("/out") // Handles POST requests to /api/punches/out
    @ResponseStatus(HttpStatus.CREATED)
    public Punch clockOut(@RequestBody Map<String, Long> payload) {
        long employeeId = payload.get("employeeId");
        return punchService.recordPunch(employeeId, "OUT");
    }

    @GetMapping("/employee/{employeeId}") // Handles GET requests to /api/punches/employee/{employeeId}
    public List<Punch> getPunchesForEmployee(@PathVariable long employeeId) {
        return punchService.getPunchesForEmployee(employeeId);
    }

    @GetMapping("/employee/{employeeId}/hours") // Handles GET requests to /api/punches/employee/{employeeId}/hours
    public ResponseEntity<Double> calculateHoursWorked(
            @PathVariable long employeeId,
            @RequestParam String startTime, // Expects ISO format string from frontend
            @RequestParam String endTime) { // Expects ISO format string from frontend
        try {
            LocalDateTime start = LocalDateTime.parse(startTime);
            LocalDateTime end = LocalDateTime.parse(endTime);
            double hours = punchService.calculateTotalHoursWorked(employeeId, start, end);
            return ResponseEntity.ok(hours);
        } catch (Exception e) {
            System.err.println("Error calculating hours: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
