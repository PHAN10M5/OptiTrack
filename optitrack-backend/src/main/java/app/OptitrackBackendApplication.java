package app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import app.util.DatabaseConnection;

@SpringBootApplication
public class OptitrackBackendApplication {

    public static void main(String[] args) {
        // Initialize database before starting the application
        try {
            DatabaseConnection.initializeDatabase();
            System.out.println("Database initialized successfully.");
        } catch (Exception e) {
            System.err.println("Failed to initialize database: " + e.getMessage());
            e.printStackTrace();
            // Continue with application startup even if database initialization fails
        }

        SpringApplication.run(OptitrackBackendApplication.class, args);
        System.out.println("OptiTrack Backend Application Started Successfully on port 8081!");
    }

}
