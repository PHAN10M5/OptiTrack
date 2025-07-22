package app.dao;

import app.model.Employee; // Changed import
import app.util.DatabaseConnection; // Changed import
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class EmployeeDAO {

    /**
     * Saves a new employee to the database.
     *
     * @param employee The Employee object to save. Its ID will be updated upon successful insertion.
     * @return The saved Employee object with its database-generated ID.
     * @throws SQLException if a database access error occurs.
     */
    public Employee save(Employee employee) throws SQLException {
        String sql = "INSERT INTO employees (first_name, last_name, department) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection(); // Changed class name
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, employee.getFirstName());
            pstmt.setString(2, employee.getLastName());
            pstmt.setString(3, employee.getDepartment());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating employee failed, no rows affected.");
            }

            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    employee.setId(generatedKeys.getLong(1)); // Set the generated ID back to the object
                } else {
                    throw new SQLException("Creating employee failed, no ID obtained.");
                }
            }
            return employee;
        }
    }

    /**
     * Finds an employee by their database ID.
     *
     * @param id The ID of the employee to find.
     * @return An Optional containing the Employee if found, or empty if not.
     * @throws SQLException if a database access error occurs.
     */
    public Optional<Employee> findById(long id) throws SQLException {
        String sql = "SELECT id, first_name, last_name, department FROM employees WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection(); // Changed class name
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Employee(
                            rs.getLong("id"),
                            rs.getString("first_name"),
                            rs.getString("last_name"),
                            rs.getString("department")
                    ));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Finds an employee by their first and last name.
     *
     * @param firstName The first name of the employee.
     * @param lastName The last name of the employee.
     * @return An Optional containing the Employee if found, or empty if not.
     * @throws SQLException if a database access error occurs.
     */
    public Optional<Employee> findByName(String firstName, String lastName) throws SQLException {
        String sql = "SELECT id, first_name, last_name, department FROM employees WHERE first_name = ? AND last_name = ?";
        try (Connection conn = DatabaseConnection.getConnection(); // Changed class name
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, firstName);
            pstmt.setString(2, lastName);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Employee(
                            rs.getLong("id"),
                            rs.getString("first_name"),
                            rs.getString("last_name"),
                            rs.getString("department")
                    ));
                }
            }
        }
        return Optional.empty();
    }


    /**
     * Retrieves all employees from the database.
     *
     * @return A List of all Employee objects.
     * @throws SQLException if a database access error occurs.
     */
    public List<Employee> findAll() throws SQLException {
        List<Employee> employees = new ArrayList<>();
        String sql = "SELECT id, first_name, last_name, department FROM employees";
        try (Connection conn = DatabaseConnection.getConnection(); // Changed class name
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                employees.add(new Employee(
                        rs.getLong("id"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("department")
                ));
            }
        }
        return employees;
    }

    /**
     * Updates an existing employee's details in the database.
     *
     * @param employee The Employee object with updated details.
     * @return true if the update was successful, false otherwise.
     * @throws SQLException if a database access error occurs.
     */
    public boolean update(Employee employee) throws SQLException {
        String sql = "UPDATE employees SET first_name = ?, last_name = ?, department = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection(); // Changed class name
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, employee.getFirstName());
            pstmt.setString(2, employee.getLastName());
            pstmt.setString(3, employee.getDepartment());
            pstmt.setLong(4, employee.getId());

            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    /**
     * Deletes an employee from the database by their ID.
     *
     * @param id The ID of the employee to delete.
     * @return true if the deletion was successful, false otherwise.
     * @throws SQLException if a database access error occurs.
     */
    public boolean delete(long id) throws SQLException {
        String sql = "DELETE FROM employees WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection(); // Changed class name
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }
}
