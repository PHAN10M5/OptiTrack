package app.dto;

import app.model.User; // Import your User model

public class UserProfileDto {
    private Long id; // User ID
    private String email;
    private String role;
    private Long employeeId; // Associated Employee ID
    private String firstName;
    private String lastName;
    private String department; // From Employee

    public UserProfileDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.role = user.getRole();
        if (user.getEmployee() != null) {
            this.employeeId = user.getEmployee().getId();
            this.firstName = user.getEmployee().getFirstName();
            this.lastName = user.getEmployee().getLastName();
            this.department = user.getEmployee().getDepartment(); // Assuming Employee has getDepartment()
        } else {
            this.employeeId = null; // Or handle as appropriate if admin user has no employee relation
            this.firstName = null;
            this.lastName = null;
            this.department = null;
        }
    }

    // Getters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getEmployeeId() { return employeeId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getDepartment() { return department; }
    // No setters needed for a response DTO
}
