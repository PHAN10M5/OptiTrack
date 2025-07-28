package app.controller;

import app.model.Employee;
import app.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController // Marks this class as a REST controller
@RequestMapping("/employees") // Base path for employee-related endpoints
public class EmployeeController {

    private final EmployeeService employeeService;

    // Spring will inject the EmployeeService automatically
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping // Handles GET requests to /employees
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}") // Handles GET requests to /employees/{id}
    public ResponseEntity<Employee> getEmployeeById(@PathVariable long id) {
        Optional<Employee> employee = employeeService.getEmployeeById(id);
        return employee.map(ResponseEntity::ok) // If employee found, return 200 OK with employee
                .orElseGet(() -> ResponseEntity.notFound().build()); // Else, return 404 Not Found
    }

    @PostMapping // Handles POST requests to /employees
    @ResponseStatus(HttpStatus.CREATED) // Returns 201 Created status on success
    public Employee createEmployee(@RequestBody Employee employee) { // @RequestBody maps JSON to Employee object
        return employeeService.createEmployee(employee.getFirstName(), employee.getLastName(), employee.getDepartment());
    }

    @PutMapping("/{id}") // Handles PUT requests to /employees/{id}
    public ResponseEntity<Employee> updateEmployee(@PathVariable long id, @RequestBody Employee employeeDetails) {
        Optional<Employee> existingEmployee = employeeService.getEmployeeById(id);
        if (existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            employee.setFirstName(employeeDetails.getFirstName());
            employee.setLastName(employeeDetails.getLastName());
            employee.setDepartment(employeeDetails.getDepartment());
            employeeService.updateEmployee(employee);
            return ResponseEntity.ok(employee);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}") // Handles DELETE requests to /employees/{id}
    @ResponseStatus(HttpStatus.NO_CONTENT) // Returns 204 No Content on successful deletion
    public ResponseEntity<Void> deleteEmployee(@PathVariable long id) {
        if (employeeService.deleteEmployee(id)) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found if employee doesn't exist
        }
    }
}
