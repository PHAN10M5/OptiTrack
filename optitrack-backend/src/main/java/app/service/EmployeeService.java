package app.service;

import app.dao.EmployeeDAO; // Changed import
import app.model.Employee; // Changed import
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeDAO employeeDAO;

    public EmployeeService(EmployeeDAO employeeDAO) {
        this.employeeDAO = employeeDAO;
    }

    /**
     * Creates a new employee and saves them to the database.
     *
     * @param firstName The employee's first name.
     * @param lastName The employee's last name.
     * @param department The employee's department (can be null).
     * @return The newly created Employee object with its database ID.
     * @throws RuntimeException if a database error occurs.
     */
    public Employee createEmployee(String firstName, String lastName, String department) {
        try {
            Employee employee = new Employee(firstName, lastName, department);
            return employeeDAO.save(employee);
        } catch (SQLException e) {
            System.err.println("Error creating employee: " + e.getMessage());
            throw new RuntimeException("Failed to create employee.", e);
        }
    }

    /**
     * Retrieves an employee by their ID.
     *
     * @param id The ID of the employee.
     * @return An Optional containing the Employee if found, or empty if not.
     * @throws RuntimeException if a database error occurs.
     */
    public Optional<Employee> getEmployeeById(long id) {
        try {
            return employeeDAO.findById(id);
        } catch (SQLException e) {
            System.err.println("Error retrieving employee by ID: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve employee.", e);
        }
    }

    /**
     * Retrieves an employee by their first and last name.
     *
     * @param firstName The first name of the employee.
     * @param lastName The last name of the employee.
     * @return An Optional containing the Employee if found, or empty if not.
     * @throws RuntimeException if a database error occurs.
     */
    public Optional<Employee> getEmployeeByName(String firstName, String lastName) {
        try {
            return employeeDAO.findByName(firstName, lastName);
        } catch (SQLException e) {
            System.err.println("Error retrieving employee by name: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve employee.", e);
        }
    }

    /**
     * Retrieves all employees from the database.
     *
     * @return A List of all Employee objects.
     * @throws RuntimeException if a database error occurs.
     */
    public List<Employee> getAllEmployees() {
        try {
            return employeeDAO.findAll();
        } catch (SQLException e) {
            System.err.println("Error retrieving all employees: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve all employees.", e);
        }
    }

    /**
     * Updates an existing employee's details in the database.
     *
     * @param employee The Employee object with updated details.
     * @return true if the update was successful, false otherwise.
     * @throws RuntimeException if a database error occurs.
     */
    public boolean updateEmployee(Employee employee) {
        try {
            return employeeDAO.update(employee);
        } catch (SQLException e) {
            System.err.println("Error updating employee: " + e.getMessage());
            throw new RuntimeException("Failed to update employee.", e);
        }
    }

    /**
     * Deletes an employee from the database.
     *
     * @param id The ID of the employee to delete.
     * @return true if the deletion was successful, false otherwise.
     * @throws RuntimeException if a database error occurs.
     */
    public boolean deleteEmployee(long id) {
        try {
            return employeeDAO.delete(id);
        } catch (SQLException e) {
            System.err.println("Error deleting employee: " + e.getMessage());
            throw new RuntimeException("Failed to delete employee.", e);
        }
    }
}
