package app.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

@Entity
@Table(name = "users")
public class User implements UserDetails { // <-- Implements UserDetails

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", unique = true)
    private Employee employee;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "role", nullable = false, length = 20)
    private String role;

    @Column(name = "reset_token", length = 255)
    private String resetToken;

    @Column(name = "token_expiry_date")
    private LocalDateTime tokenExpiryDate;

    // Default constructor is required by JPA
    public User() {}

    // Constructor for creating new users
    public User(Employee employee, String email, String passwordHash, String role) {
        this.employee = employee;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // Full constructor
    public User(Long id, Employee employee, String email, String passwordHash, String role, String resetToken, LocalDateTime tokenExpiryDate) {
        this.id = id;
        this.employee = employee;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.resetToken = resetToken;
        this.tokenExpiryDate = tokenExpiryDate;
    }

    // --- Getters ---
    public Long getId() { return id; }
    public Employee getEmployee() { return employee; }
    public Long getEmployeeId() { return employee != null ? employee.getId() : null; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public String getResetToken() { return resetToken; }
    public LocalDateTime getTokenExpiryDate() { return tokenExpiryDate; }

    // --- Setters ---
    public void setId(Long id) { this.id = id; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(String role) { this.role = role; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public void setTokenExpiryDate(LocalDateTime tokenExpiryDate) { this.tokenExpiryDate = tokenExpiryDate; }

    // --- UserDetails Interface Methods ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.role.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // --- Existing overridden methods ---
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", employeeId=" + (employee != null ? employee.getId() : "null") +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id != null && Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return id != null ? Objects.hash(id) : Objects.hash(employee, email);
    }
}