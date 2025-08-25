package app.service;

import app.model.Employee;
import app.model.User;
import app.repository.EmployeeRepository;
import app.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // Import UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException; // Import UsernameNotFoundException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService implements UserDetailsService { // <-- IMPLEMENT UserDetailsService

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final BCryptPasswordEncoder passwordEncoder; // Ensure this is correctly injected
    private final EmailService emailService;

    // Constructor updated to inject all necessary dependencies, including BCryptPasswordEncoder
    public UserService(UserRepository userRepository, EmployeeRepository employeeRepository,
                       BCryptPasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder; // Injected BCryptPasswordEncoder
        this.emailService = emailService;
    }

    /**
     * Required by UserDetailsService interface.
     * Locates the user based on the email (username for Spring Security).
     * Used by Spring Security's AuthenticationProvider during login.
     *
     * @param email The email address of the user (Spring Security's "username").
     * @return a fully populated UserDetails object.
     * @throws UsernameNotFoundException if the user could not be found or the user has no GrantedAuthority.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Return the user object directly, as it now implements UserDetails
        return user;
    }

    /**
     * Registers a new user with a hashed password.
     *
     * @param employeeId The ID of the employee this user account is associated with. Can be null for initial setup (e.g., admin).
     * @param email The user's email address.
     * @param plainTextPassword The user's plain text password.
     * @param role The user's role (e.g., "admin", "employee").
     * @return The newly registered User object.
     * @throws IllegalArgumentException if employeeId is provided but employee does not exist.
     */
    public User registerUser(Long employeeId, String email, String plainTextPassword, String role) {
        // Validate employee association if an employeeId is provided
        Employee associatedEmployee = null;
        if (employeeId != null) {
            Optional<Employee> optionalEmployee = employeeRepository.findById(employeeId);
            if (optionalEmployee.isEmpty()) {
                throw new IllegalArgumentException("Employee with ID " + employeeId + " not found. Cannot register user.");
            }
            associatedEmployee = optionalEmployee.get();
        }

        String hashedPassword = passwordEncoder.encode(plainTextPassword);
        // Create User with Employee object, not just ID
        User newUser = new User(associatedEmployee, email, hashedPassword, role);
        return userRepository.save(newUser);
    }

    // This method is often redundant when using Spring Security's AuthenticationManager,
    // as the authentication logic is handled by the AuthenticationProvider which uses loadUserByUsername
    // and the PasswordEncoder. However, it's left for now as it was in your original code.
    /**
     * Authenticates a user based on email and password.
     *
     * @param email The user's email address.
     * @param password The plain text password.
     * @return The authenticated User object.
     * @throws IllegalArgumentException if authentication fails.
     */
    public User authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials: User not found.");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials: Incorrect password.");
        }

        return user;
    }

    /**
     * Initializes demo user accounts if no users exist in the database.
     * Updated to handle Employee association properly.
     */
    public void initializeDemoAccounts() {
        if (userRepository.count() == 0) {
            System.out.println("No users found in database. Initializing demo accounts...");

            Employee dummyAdminEmployee = employeeRepository.save(new Employee(
                    "Demo",
                    "Admin",
                    "admin@example.com",
                    "Administration",
                    "Administrator",
                    "123-456-7890",
                    "123 Admin St, City",
                    LocalDate.of(2023, 1, 1)
            ));

            Employee dummyEmployee = employeeRepository.save(new Employee(
                    "Demo",
                    "Employee",
                    "employee@example.com",
                    "Operations",
                    "Associate",
                    "987-654-3210",
                    "456 Employee Ave, Town",
                    LocalDate.of(2023, 6, 15)
            ));

            User adminUser = registerUser(
                    dummyAdminEmployee.getId(),
                    "john.doe@optitrack.com",
                    "password123",
                    "ADMIN"
            );
            if (adminUser != null) {
                System.out.println("Admin demo account created: " + adminUser.getEmail());
            } else {
                System.err.println("Failed to create admin demo account.");
            }

            User employeeUser = registerUser(
                    dummyEmployee.getId(),
                    "sarah.smith@optitrack.com",
                    "password123",
                    "EMPLOYEE"
            );
            if (employeeUser != null) {
                System.out.println("Employee demo account created: " + employeeUser.getEmail());
            } else {
                System.err.println("Failed to create employee demo account.");
            }
        } else {
            System.out.println("Users already exist in database. Skipping demo account initialization.");
        }
    }

    /**
     * Initiates the password setup process for an employee by generating a token,
     * saving it, and sending an email.
     * @param employeeEmail The email of the employee to set up a password for.
     * @return true if the email was sent successfully, false otherwise.
     */
    public boolean initiatePasswordSetup(String employeeEmail) {
        Optional<User> userOptional = userRepository.findByEmail(employeeEmail);
        if (userOptional.isEmpty()) {
            System.err.println("Attempted to initiate password setup for non-existent email: " + employeeEmail);
            return false;
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        int affectedRows = userRepository.updateResetToken(user.getId(), token, expiryDate);

        if (affectedRows > 0) {
            String setupLink = "http://localhost:3000/set-password?token=" + token;
            String emailSubject = "OptiTrack: Set Up Your Password";
            String emailBody = "Dear " + user.getEmail() + ",\n\n" +
                    "You have been added to the OptiTrack system. Please click the link below to set up your password:\n\n" +
                    setupLink + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Thanks,\nOptiTrack Team";
            emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
            System.out.println("Password setup email sent to: " + user.getEmail());
            return true;
        } else {
            System.err.println("Failed to update reset token for user: " + user.getEmail());
            return false;
        }
    }

    /**
     * Validates a password setup token and updates the user's password.
     * @param token The reset token provided by the user.
     * @param newPlainTextPassword The new plain text password.
     * @return true if password was successfully updated, false otherwise.
     */
    public boolean setupNewPassword(String token, String newPlainTextPassword) {
        Optional<User> userOptional = userRepository.findByResetToken(token);

        if (userOptional.isEmpty()) {
            System.err.println("Invalid password setup token: Token not found.");
            return false;
        }

        User user = userOptional.get();

        if (user.getTokenExpiryDate() == null || user.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            System.err.println("Password setup token expired for user: " + user.getEmail());
            userRepository.updateResetToken(user.getId(), null, null);
            return false;
        }

        String newHashedPassword = passwordEncoder.encode(newPlainTextPassword);

        int affectedRows = userRepository.updatePasswordAndClearToken(user.getId(), newHashedPassword);

        if (affectedRows > 0) {
            System.out.println("Password successfully set for user: " + user.getEmail());
            return true;
        } else {
            System.err.println("Failed to update password for user: " + user.getEmail());
            return false;
        }
    }

    public User getUserByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.orElse(null); // Or throw a custom exception if user not found
    }

    /**
     * Finds a user by their ID.
     * @param id The ID of the user.
     * @return An Optional containing the User if found, or empty otherwise.
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}