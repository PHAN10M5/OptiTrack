package app.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public class User {
    private int id;
    private String email;
    private String password;
    private String salt;
    private String role;
    private int employeeId;
    private boolean isActive;

    public User() {
        this.isActive = true;
        this.salt = generateSalt();
    }

    public User(String password, String email, int employeeId, String role) {
        this();
        this.password = password; // This should be hashed with salt before storing
        this.email = email;
        this.employeeId = employeeId;
        this.role = role;
    }
    public String getPassword() {
        return password;
    }

    public String getSalt() {
        return salt;
    }

    public String getEmail() {
        return email;
    }

    public boolean isActive() {
        return isActive;
    }

    public int getEmployeeId() {
        return employeeId;
    }

    public String getRole() {
        return role;
    }

    public void setId(int id) {
        this.id = id;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public void setEmployeeId(int employeeId) {
        this.employeeId = employeeId;
    }

    public void setRole(String role) {
        this.role = role;
    }
    private String generateSalt() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        return java.util.Base64.getEncoder().encodeToString(saltBytes);
    }

    @Override
    public String toString() {
        return "User{" +
                ", email='" + email + '\'' +
                ", isActive=" + isActive +
                ", employeeId=" + employeeId +
                ", role='" + role + '\'' +
                '}';
    }
}
