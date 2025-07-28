package app.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {
    // MySQL connection details for XAMPP
    // IMPORTANT: Ensure this DB_URL matches the actual database name in phpMyAdmin
    private static final String DB_URL = "jdbc:mysql://localhost:3306/optitrackdatabase"; // CHANGED: from optitrack_db to optitrackdatabase
    private static final String DB_USER = "root"; // Default XAMPP MySQL username
    private static final String DB_PASSWORD = ""; // Default XAMPP MySQL password (empty)

    /**
     * Establishes and returns a connection to the MySQL database.
     * @return A Connection object.
     * @throws SQLException if a database access error occurs.
     */
    public static Connection getConnection() throws SQLException {
        // Ensure the JDBC driver is loaded (though often not strictly necessary with modern JDBC 4.0+)
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found. Make sure mysql-connector-java.jar is in your classpath.");
            throw new SQLException("MySQL JDBC Driver not found.", e);
        }
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    /**
     * Initializes the database by creating tables if they do not already exist.
     * This method should be called once at application startup.
     */
    public static void initializeDatabase() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            // Create employees table for MySQL
            String createEmployeesTableSQL = "CREATE TABLE IF NOT EXISTS employees (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "first_name VARCHAR(255) NOT NULL," +
                    "last_name VARCHAR(255) NOT NULL," +
                    "department VARCHAR(255)" +
                    ");";
            stmt.execute(createEmployeesTableSQL);
            System.out.println("Table 'employees' checked/created successfully.");

            // Create punches table for MySQL
            String createPunchesTableSQL = "CREATE TABLE IF NOT EXISTS punches (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "employee_id BIGINT NOT NULL," +
                    "punch_type VARCHAR(10) NOT NULL," +
                    "timestamp DATETIME NOT NULL," +
                    "FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE" +
                    ");";
            stmt.execute(createPunchesTableSQL);
            System.out.println("Table 'punches' checked/created successfully.");

            // Create overtime_requests table for MySQL (NEW TABLE)
            String createOvertimeRequestsTableSQL = "CREATE TABLE IF NOT EXISTS overtime_requests (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "employee_id BIGINT NOT NULL," +
                    "request_date_time DATETIME NOT NULL," +
                    "requested_hours DOUBLE NOT NULL," +
                    "status VARCHAR(50) NOT NULL," +
                    "reason TEXT," +
                    "FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE" +
                    ");";
            stmt.execute(createOvertimeRequestsTableSQL);
            System.out.println("Table 'overtime_requests' checked/created successfully.");


        } catch (SQLException e) {
            System.err.println("Error initializing database: " + e.getMessage());
            // Updated message to reflect the correct database name you have
            System.err.println("Please ensure MySQL is running via XAMPP and 'optitrackdatabase' database exists.");
            // In a real application, you might want to log this error and exit.
        }
    }
}
