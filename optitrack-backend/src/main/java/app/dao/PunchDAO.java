package app.dao;

import app.model.Punch;
import app.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter; // Import DateTimeFormatter
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository; // Keep this import

@Repository // Keep this annotation
public class PunchDAO {

    // Define a formatter for the exact string format MySQL DATETIME returns
    // MySQL DATETIME typically returns "YYYY-MM-DD HH:MM:SS"
    private static final DateTimeFormatter MYSQL_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Saves a new punch record to the database.
     *
     * @param punch The Punch object to save. Its ID will be updated upon successful insertion.
     * @return The saved Punch object with its database-generated ID.
     * @throws SQLException if a database access error occurs.
     */
    public Punch save(Punch punch) throws SQLException {
        String sql = "INSERT INTO punches (employee_id, punch_type, timestamp) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, punch.getEmployeeId());
            pstmt.setString(2, punch.getPunchType());
            // Use formatter to ensure the timestamp is stored in the exact format MySQL DATETIME expects
            pstmt.setString(3, punch.getTimestamp().format(MYSQL_DATETIME_FORMATTER));

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating punch failed, no rows affected.");
            }

            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    punch.setId(generatedKeys.getLong(1)); // Set the generated ID back to the object
                } else {
                    throw new SQLException("Creating punch failed, no ID obtained.");
                }
            }
            return punch;
        }
    }

    /**
     * Finds a punch record by its database ID.
     *
     * @param id The ID of the punch to find.
     * @return An Optional containing the Punch if found, or empty if not.
     * @throws SQLException if a database access error occurs.
     */
    public Optional<Punch> findById(long id) throws SQLException {
        String sql = "SELECT id, employee_id, punch_type, timestamp FROM punches WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    // Parse using the defined formatter to match MySQL's DATETIME string format
                    return Optional.of(new Punch(
                            rs.getLong("id"),
                            rs.getLong("employee_id"),
                            rs.getString("punch_type"),
                            LocalDateTime.parse(rs.getString("timestamp"), MYSQL_DATETIME_FORMATTER) // Use formatter
                    ));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Retrieves all punch records for a specific employee.
     *
     * @param employeeId The ID of the employee whose punches to retrieve.
     * @return A List of Punch objects for the given employee, sorted by timestamp.
     * @throws SQLException if a database access error occurs.
     */
    public List<Punch> findByEmployeeId(long employeeId) throws SQLException {
        List<Punch> punches = new ArrayList<>();
        String sql = "SELECT id, employee_id, punch_type, timestamp FROM punches WHERE employee_id = ? ORDER BY timestamp ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, employeeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    punches.add(new Punch(
                            rs.getLong("id"),
                            rs.getLong("employee_id"),
                            rs.getString("punch_type"),
                            LocalDateTime.parse(rs.getString("timestamp"), MYSQL_DATETIME_FORMATTER) // Use formatter
                    ));
                }
            }
        }
        return punches;
    }

    /**
     * Retrieves the last punch record for a specific employee.
     *
     * @param employeeId The ID of the employee.
     * @return An Optional containing the last Punch for the employee, or empty if none exist.
     * @throws SQLException if a database access error occurs.
     */
    public Optional<Punch> findLastPunchByEmployeeId(long employeeId) throws SQLException {
        String sql = "SELECT id, employee_id, punch_type, timestamp FROM punches WHERE employee_id = ? ORDER BY timestamp DESC LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, employeeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Punch(
                            rs.getLong("id"),
                            rs.getLong("employee_id"),
                            rs.getString("punch_type"),
                            LocalDateTime.parse(rs.getString("timestamp"), MYSQL_DATETIME_FORMATTER) // Use formatter
                    ));
                }
            }
        }
        return Optional.empty();
    }

    /**
     * Deletes a punch record from the database by its ID.
     *
     * @param id The ID of the punch to delete.
     * @return true if the deletion was successful, false otherwise.
     * @throws SQLException if a database access error occurs.
     */
    public boolean delete(long id) throws SQLException {
        String sql = "DELETE FROM punches WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }
}
