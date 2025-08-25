// app/controller/ReportController.java
package app.controller;

import app.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Endpoint to get an employee's total working hours for today.
     * Example: GET /api/reports/today-hours?employeeId=1
     * @param employeeId The ID of the employee.
     * @return ResponseEntity with the total hours.
     */
    @GetMapping("/today-hours")
    public ResponseEntity<Double> getTodaysHours(@RequestParam Long employeeId) {
        if (employeeId == null) {
            return new ResponseEntity<>(0.0, HttpStatus.BAD_REQUEST); // Or throw an exception
        }
        try {
            double hours = reportService.getTodaysHours(employeeId);
            return new ResponseEntity<>(hours, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching today's hours for employee " + employeeId + ": " + e.getMessage());
            return new ResponseEntity<>(0.0, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint to get an employee's total working hours for the current week.
     * Example: GET /api/reports/weekly-hours?employeeId=1
     * @param employeeId The ID of the employee.
     * @return ResponseEntity with the total hours.
     */
    @GetMapping("/weekly-hours")
    public ResponseEntity<Double> getWeeklyHours(@RequestParam Long employeeId) {
        if (employeeId == null) {
            return new ResponseEntity<>(0.0, HttpStatus.BAD_REQUEST); // Or throw an exception
        }
        try {
            double hours = reportService.getWeeklyHours(employeeId);
            return new ResponseEntity<>(hours, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching weekly hours for employee " + employeeId + ": " + e.getMessage());
            return new ResponseEntity<>(0.0, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}