package app;

import app.model.Employee;
import app.model.User;
import app.repository.EmployeeRepository;
import app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate; // Import LocalDate for hireDate
import java.util.Properties;

@SpringBootApplication
public class OptitrackBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OptitrackBackendApplication.class, args);
        System.out.println("OptiTrack Backend Application Started Successfully on port 8081!");
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Initializes demo data (employees and users) if the database is empty.
     * Uses the new Spring Data JPA repositories.
     *
     * @param employeeRepository The Spring Data JPA EmployeeRepository.
     * @param userRepository The Spring Data JPA UserRepository.
     * @param passwordEncoder The BCryptPasswordEncoder bean.
     * @return A CommandLineRunner bean.
     */
    @Bean
    public CommandLineRunner initData(EmployeeRepository employeeRepository, UserRepository userRepository,
                                      BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            try {
                if (userRepository.count() == 0) {
                    System.out.println("No users found, inserting sample data...");

                    // --- FIX STARTS HERE ---
                    // Create Employees first with all required fields (email, position, contactNumber, address, hireDate)
                    Employee adminEmployee = new Employee(
                            "John",
                            "Doe",
                            "john.doe@optitrack.com", // Unique email for admin
                            "Administration",
                            "Administrator",
                            "111-222-3333",
                            "101 Main St, Anytown, USA",
                            LocalDate.of(2022, 1, 1) // Example hire date
                    );
                    employeeRepository.save(adminEmployee);

                    Employee regularEmployee = new Employee(
                            "Sarah",
                            "Smith",
                            "sarah.smith@optitrack.com", // Unique email for regular employee
                            "Marketing",
                            "Marketing Specialist",
                            "444-555-6666",
                            "202 Market Rd, Otherville, USA",
                            LocalDate.of(2023, 5, 15) // Example hire date
                    );
                    employeeRepository.save(regularEmployee);

                    // --- FIX ENDS HERE ---

                    // Create Users for these employees
                    User adminUser = new User(adminEmployee, "john.doe@optitrack.com", passwordEncoder.encode("password123"), "ADMIN");
                    userRepository.save(adminUser);

                    User regularUser = new User(regularEmployee, "sarah.smith@optitrack.com", passwordEncoder.encode("password123"), "EMPLOYEE");
                    userRepository.save(regularUser);

                    System.out.println("Sample employees and users inserted.");
                } else {
                    System.out.println("Employees and users already exist, skipping sample data insertion.");
                }

            } catch (Exception e) {
                System.err.println("Error during initial data setup: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }

    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);

        mailSender.setUsername("myathein060@gmail.com");
        mailSender.setPassword("efip qfql afnf uiox");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.debug", "true");

        return mailSender;
    }
}