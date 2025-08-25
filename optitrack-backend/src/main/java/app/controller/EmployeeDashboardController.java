package app.controller;

import app.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/employee/dashboard") // Base path for employee dashboard endpoints
public class EmployeeDashboardController {

    private final DashboardService dashboardService;

    public EmployeeDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Endpoint to retrieve statistics for a specific employee's dashboard.
     * This endpoint should ideally be secured to ensure an employee can only access their own data.
     *
     * Example: GET /api/employee/dashboard/stats/{employeeId}
     *
     * @param employeeId The ID of the employee whose dashboard stats are requested.
     * @return ResponseEntity containing a Map of employee dashboard statistics.
     */
    @GetMapping("/stats/{employeeId}")
    public ResponseEntity<Map<String, Object>> getEmployeeDashboardStats(@PathVariable Long employeeId) {
        // In a real application, you would also verify that the authenticated user
        // matches the employeeId requested or has permission to view it.
        // For now, we'll proceed directly.

        try {
            Map<String, Object> stats = dashboardService.getEmployeeDashboardStats(employeeId);
            return ResponseEntity.ok(stats);
        } catch (IllegalArgumentException e) {
            // Employee not found or other validation error
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // General error
            System.err.println("Error fetching employee dashboard stats for " + employeeId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred."));
        }
    }
}
