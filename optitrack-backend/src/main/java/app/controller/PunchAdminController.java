// src/main/java/app/controller/PunchAdminController.java
package app.controller;

import app.dto.PunchRecordDto; // Import the PunchRecordDto
import app.service.PunchService; // We will use PunchService for punch data
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin; // Recommended for frontend interaction

import java.util.List;

@RestController
@RequestMapping("/api/admin/punches") // This is the base path for admin punch operations
@CrossOrigin(origins = "http://localhost:3000") // Allow your frontend to connect
public class PunchAdminController {

    private final PunchService punchService; // Inject PunchService

    public PunchAdminController(PunchService punchService) {
        this.punchService = punchService;
    }

    /**
     * Endpoint to retrieve all punch records for the Admin Punch Logs page.
     * Accessible only by users with the 'ADMIN' role.
     *
     * Example: GET /api/admin/punches/all
     *
     * @return ResponseEntity containing a List of PunchRecordDto.
     */
    @GetMapping("/all") // This endpoint will return all punches for the admin view
    @PreAuthorize("hasRole('ADMIN')") // Strict ADMIN access
    public ResponseEntity<List<PunchRecordDto>> getAllPunchesForAdmin() {
        List<PunchRecordDto> punches = punchService.findAllPunchesSortedDesc(); // Call the service method
        return ResponseEntity.ok(punches);
    }

    // You can add other admin-specific punch operations here in the future,
    // like editing or deleting punches, generating reports, etc.
}