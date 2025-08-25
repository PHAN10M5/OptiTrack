package app.service;

import app.model.Employee;
import app.dto.EmployeeDto;
import app.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate; // Import LocalDate for hireDate
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<EmployeeDto> findAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(employee -> new EmployeeDto(
                        employee.getId(),
                        employee.getFirstName(),
                        employee.getLastName(),
                        employee.getDepartment()
                ))
                .collect(Collectors.toList());
    }

    // --- UPDATED createEmployee METHOD ---
    /**
     * Creates a new employee and saves them to the database.
     * Checks for duplicate email before saving.
     *
     * @param employee The Employee object containing all details.
     * @return The newly created Employee object with its database ID.
     * @throws IllegalArgumentException if an employee with the same email already exists.
     */
    public Employee createEmployee(Employee employee) {
        // Ensure email is not null and check for uniqueness
        if (employee.getEmail() == null || employee.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty for new employees.");
        }
        if (employeeRepository.findByEmail(employee.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An employee with this email already exists.");
        }

        // JpaRepository's save() method handles both insert and update based on ID presence
        return employeeRepository.save(employee);
    }

    // --- Get methods remain largely the same, but ensure they can retrieve new fields ---
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByName(String firstName, String lastName) {
        return employeeRepository.findByFirstNameAndLastName(firstName, lastName);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // --- UPDATED updateEmployee METHOD ---
    /**
     * Updates an existing employee's details in the database.
     * Handles specific fields including email, contact number, and address.
     * Checks for duplicate email if the email is being changed.
     *
     * @param id The ID of the employee to update.
     * @param updatedEmployee The Employee object with updated details.
     * @return The updated Employee object.
     * @throws RuntimeException if the employee is not found.
     * @throws IllegalArgumentException if the updated email conflicts with another employee.
     */
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        return employeeRepository.findById(id).map(existingEmployee -> {
            // Check for duplicate email ONLY if the email is being changed
            if (!existingEmployee.getEmail().equals(updatedEmployee.getEmail())) {
                if (employeeRepository.findByEmail(updatedEmployee.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Another employee with this email already exists.");
                }
            }

            existingEmployee.setFirstName(updatedEmployee.getFirstName());
            existingEmployee.setLastName(updatedEmployee.getLastName());
            existingEmployee.setEmail(updatedEmployee.getEmail()); // Update email
            existingEmployee.setDepartment(updatedEmployee.getDepartment());
            existingEmployee.setPosition(updatedEmployee.getPosition()); // Ensure position is handled if present
            existingEmployee.setContactNumber(updatedEmployee.getContactNumber()); // Update contactNumber
            existingEmployee.setAddress(updatedEmployee.getAddress());             // Update address
            existingEmployee.setHireDate(updatedEmployee.getHireDate());           // Update hireDate

            return employeeRepository.save(existingEmployee);
        }).orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));
    }


    public boolean deleteEmployee(Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}