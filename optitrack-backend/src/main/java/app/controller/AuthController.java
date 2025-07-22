package app.controller;

import app.dto.LoginRequest;
import app.dto.LoginResponse; // We'll create this DTO
import app.dto.UserProfileDto; // We'll create this DTO
import app.model.User;
import app.service.UserService;
import app.service.JwtService; // Import JwtService
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Common prefix for auth endpoints
@CrossOrigin(origins = "http://localhost:3000") // Allow your frontend to connect
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService; // Inject JwtService
    private final UserService userService; // Inject UserService

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate a REAL JWT token
            String jwt = jwtService.generateToken(userDetails);

            // Fetch the User object to get employee details
            User authenticatedUser = userService.getUserByEmail(userDetails.getUsername()); // Make sure this method exists

            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User details not found after authentication.");
            }

            // Create a LoginResponse DTO
            LoginResponse response = new LoginResponse();
            response.setMessage("Login successful");
            response.setToken(jwt);
            response.setRole(authenticatedUser.getRole());
            if (authenticatedUser.getEmployee() != null) {
                response.setEmployeeId(authenticatedUser.getEmployee().getId());
                response.setEmployeeFullName(authenticatedUser.getEmployee().getFirstName() + " " + authenticatedUser.getEmployee().getLastName());
                response.setDepartment(authenticatedUser.getEmployee().getDepartment());
            }

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("An error occurred during login: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName(); // Get email from authenticated principal (username)
            User user = userService.getUserByEmail(email); // Fetch the full User entity

            if (user != null) {
                // Return a specific DTO for user profile
                return ResponseEntity.ok(new UserProfileDto(user));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // Helper class for error responses
    static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}