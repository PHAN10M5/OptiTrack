package app.controller;

import app.model.Employee;
import app.service.EmployeeService;
import app.dto.EmployeeDto; // Import the new EmployeeDto
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Import for @PreAuthorize
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // --- NEW/UPDATED: Endpoint to get all employees for Admin view, returning DTOs ---
    @GetMapping("/all") // Changed path to differentiate if needed, or you can keep @GetMapping without path for default
    @PreAuthorize("hasRole('ADMIN')") // Only ADMINs can access this endpoint
    public ResponseEntity<List<EmployeeDto>> getAllEmployeesForAdmin() { // Renamed method for clarity
        List<EmployeeDto> employees = employeeService.findAllEmployees(); // Call the service method that returns DTOs
        return ResponseEntity.ok(employees);
    }

    // Existing: Get Employee by ID (can be kept as is, depending on other uses)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('EMPLOYEE') and @employeeService.isEmployeeOwner(#id))")
    // Example: allow admin or employee to view their own profile
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Optional<Employee> employee = employeeService.getEmployeeById(id);
        return employee.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Existing: Create Employee
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')") // Typically only ADMINs can create employees
    public ResponseEntity<?> createEmployee(@Valid @RequestBody Employee employee) {
        try {
            Employee createdEmployee = employeeService.createEmployee(employee);
            return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating employee: " + e.getMessage());
        }
    }

    // Existing: Update Employee
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Typically only ADMINs can update arbitrary employees
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employeeDetails) {
        try {
            Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
            return ResponseEntity.ok(updatedEmployee);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Employee not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating employee: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    // Existing: Delete Employee
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')") // Only ADMINs can delete employees
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (employeeService.deleteEmployee(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}