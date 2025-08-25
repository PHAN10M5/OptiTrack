package app.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {
    // MySQL connection details for XAMPP
    private static final String DB_URL = "jdbc:mysql://localhost:3306/optitrackdatabase?useSSL=false&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "";

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found. Make sure mysql-connector-java.jar is in your classpath.");
            throw new SQLException("MySQL JDBC Driver not found.", e);
        }
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    public static void initializeDatabase() throws SQLException {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            // --- UPDATED employees table creation statement ---
            stmt.execute("CREATE TABLE IF NOT EXISTS employees (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "first_name VARCHAR(255) NOT NULL," +
                    "last_name VARCHAR(255) NOT NULL," +
                    "email VARCHAR(255) UNIQUE NOT NULL," + // Added email
                    "department VARCHAR(255)," +
                    "position VARCHAR(255)," +       // Added position
                    "contact_number VARCHAR(20)," +  // Added contact_number
                    "address VARCHAR(255)," +        // Added address
                    "hire_date DATE" +               // Added hire_date
                    ");");
            // --- END UPDATED employees table ---

            // Create punches table
            stmt.execute("CREATE TABLE IF NOT EXISTS punches (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "employee_id INT NOT NULL," +
                    "punch_type VARCHAR(10) NOT NULL," + // e.g., 'IN', 'OUT'
                    "timestamp DATETIME NOT NULL," +
                    "FOREIGN KEY (employee_id) REFERENCES employees(id)" +
                    ");");

            // Create overtime_requests table
            stmt.execute("CREATE TABLE IF NOT EXISTS overtime_requests (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "employee_id INT NOT NULL," +
                    "request_date_time DATETIME NOT NULL," +
                    "requested_hours DOUBLE NOT NULL," +
                    "status VARCHAR(50) NOT NULL DEFAULT 'PENDING'," + // e.g., PENDING, APPROVED, REJECTED
                    "reason TEXT," +
                    "FOREIGN KEY (employee_id) REFERENCES employees(id)" +
                    ");");

            // Create or alter users table (THIS IS THE CORRECTED PART)
            stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "employee_id INT UNIQUE NOT NULL," +
                    "email VARCHAR(255) UNIQUE NOT NULL," +
                    "password_hash VARCHAR(255) NOT NULL," +
                    "role VARCHAR(50) NOT NULL," +
                    "reset_token VARCHAR(255) UNIQUE," +
                    "token_expiry_date DATETIME," +
                    "FOREIGN KEY (employee_id) REFERENCES employees(id)" +
                    ");");


            System.out.println("Database schema initialized successfully.");

        } catch (SQLException e) {
            System.err.println("Failed to initialize database schema: " + e.getMessage());
            throw e;
        }
    }
}