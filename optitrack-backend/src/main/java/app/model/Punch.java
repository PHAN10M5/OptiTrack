package app.model;

import jakarta.persistence.*; // Use jakarta.persistence for Spring Boot 3+
import java.time.LocalDateTime;
import java.util.Objects;

@Entity // Marks this class as a JPA entity
@Table(name = "punches") // Specifies the table name in the database
public class Punch {

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments the ID for MySQL
    private Long id; // Use Long wrapper type for JPA entities

    // @ManyToOne relationship to Employee.
    // This creates a foreign key column in the 'punches' table that refers to the 'employees' table.
    // @JoinColumn specifies the foreign key column name in the 'punches' table (e.g., employee_id).
    // nullable = false means a punch must always be associated with an employee.
    @ManyToOne(fetch = FetchType.LAZY) // Lazy fetch to avoid loading Employee unless needed
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee; // Changed from employeeId (primitive long) to an Employee object

    @Column(name = "punch_type", nullable = false, length = 10) // Maps to 'punch_type', max length 10
    private String punchType; // "IN" or "OUT"

    @Column(name = "timestamp", nullable = false) // Maps to 'timestamp'
    private LocalDateTime timestamp;

    // Default no-argument constructor is required by JPA
    public Punch() {
        // Required by JPA
    }

    // Constructor for creating new Punch objects with an Employee object
    public Punch(Employee employee, String punchType, LocalDateTime timestamp) {
        // Input validation (kept from your code - good!)
        if (employee == null || employee.getId() == null) { // Check for valid employee object
            throw new IllegalArgumentException("Employee cannot be null and must have an ID.");
        }
        if (!"IN".equals(punchType) && !"OUT".equals(punchType)) {
            throw new IllegalArgumentException("Punch type must be 'IN' or 'OUT'.");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null.");
        }

        this.employee = employee;
        this.punchType = punchType;
        this.timestamp = timestamp;
    }

    // --- Getters ---
    public Long getId() { // Changed to Long
        return id;
    }

    public Employee getEmployee() { // Returns the Employee object
        return employee;
    }

    // You might still need employeeId getter for legacy code or DTOs,
    // but the primary way to access the associated employee is via the object.
    public Long getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }

    public String getPunchType() {
        return punchType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // --- Setters ---
    public void setId(Long id) { // Changed to Long
        this.id = id;
    }

    public void setEmployee(Employee employee) { // Setter for the Employee object
        this.employee = employee;
    }

    public void setPunchType(String punchType) {
        if (!"IN".equals(punchType) && !"OUT".equals(punchType)) {
            throw new IllegalArgumentException("Punch type must be 'IN' or 'OUT'.");
        }
        this.punchType = punchType;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null.");
        }
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "Punch{" +
                "id=" + id +
                ", employeeId=" + (employee != null ? employee.getId() : "null") + // Safely get employee ID
                ", punchType='" + punchType + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Punch punch = (Punch) o;
        // For persisted entities, equality should primarily be based on ID.
        // Check for non-null IDs to ensure they are persisted entities.
        return id != null && Objects.equals(id, punch.id);
    }

    @Override
    public int hashCode() {
        // For persisted entities, hash code should primarily be based on ID.
        return id != null ? Objects.hash(id) : Objects.hash(employee, punchType, timestamp); // Use employee object for hash if id is null
    }
}