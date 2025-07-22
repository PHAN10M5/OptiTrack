package app.controller;

import app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password-setup")
public class PasswordSetupController {

    private final UserService userService;

    @Autowired
    public PasswordSetupController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Admin initiates password setup for an employee.
     * @param request A simple DTO containing the employee's email.
     * @return ResponseEntity indicating success or failure.
     */
    @PostMapping("/initiate")
    public ResponseEntity<String> initiatePasswordSetup(@RequestBody InitiatePasswordSetupRequest request) {
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            return new ResponseEntity<>("Email is required.", HttpStatus.BAD_REQUEST);
        }
        boolean success = userService.initiatePasswordSetup(request.getEmail());
        if (success) {
            return new ResponseEntity<>("Password setup link sent to " + request.getEmail(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to initiate password setup. User not found or internal error.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Employee sets their new password using a token.
     * @param request A DTO containing the token and new password.
     * @return ResponseEntity indicating success or failure.
     */
    @PostMapping("/set")
    public ResponseEntity<String> setPassword(@RequestBody SetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isEmpty() ||
                request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return new ResponseEntity<>("Token and new password are required.", HttpStatus.BAD_REQUEST);
        }

        boolean success = userService.setupNewPassword(request.getToken(), request.getNewPassword());
        if (success) {
            return new ResponseEntity<>("Password updated successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid or expired token, or failed to update password.", HttpStatus.BAD_REQUEST);
        }
    }

    // --- DTOs (Data Transfer Objects) for requests ---
    // You would typically define these in a separate package, e.g., app.dto

    public static class InitiatePasswordSetupRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class SetPasswordRequest {
        private String token;
        private String newPassword;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}