package app.controller;

import app.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // <-- Import PreAuthorize
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin; // <-- Recommended for frontend interaction

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "http://localhost:3000") // Allow your frontend to connect
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')") // <-- REQUIRE ADMIN ROLE TO ACCESS THIS ENDPOINT
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Endpoint to retrieve recent punch activities across all employees for the admin dashboard.
     * Example: GET /api/admin/dashboard/recent-activity?limit=5
     *
     * @param limit The maximum number of activities to retrieve (default: 10).
     * @return ResponseEntity containing a List of recent activities.
     */
    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('ADMIN')") // <-- REQUIRE ADMIN ROLE TO ACCESS THIS ENDPOINT
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity(@RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> recentActivity = dashboardService.getRecentAdminActivity(limit);
        return ResponseEntity.ok(recentActivity);
    }
}