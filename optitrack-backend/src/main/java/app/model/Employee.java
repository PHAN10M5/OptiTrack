package app.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public class Employee {
    private long id; // Database ID, 0 for new employees not yet saved
    private String firstName;
    private String lastName;
    private String department;
    private final List<Punch> punches; // In-memory list of punches for this employee

    // Constructor for creating new Employee objects (before saving to DB)
    public Employee(String firstName, String lastName) {
        this(0, firstName, lastName, null); // Calls the full constructor with default ID and department
    }

    // Constructor for creating new Employee objects with department
    public Employee(String firstName, String lastName, String department) {
        this(0, firstName, lastName, department);
    }

    // Full constructor, typically used when loading from the database
    public Employee(long id, String firstName, String lastName, String department) {
        // Input validation
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name cannot be null or empty.");
        }
        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Last name cannot be null or empty.");
        }

        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.punches = new ArrayList<>(); // Initialize the list
    }

    // --- Getters ---
    public long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getDepartment() {
        return department;
    }

    /**
     * Returns an unmodifiable view of the list of punches for this employee.
     * This prevents external code from directly modifying the internal list,
     * enforcing encapsulation.
     * @return An unmodifiable List of Punch objects.
     */
    public List<Punch> getPunches() {
        return Collections.unmodifiableList(punches);
    }

    // --- Setters (for mutable attributes) ---
    // Note: ID is typically set by the database, so no public setter for it.
    // If loading from DB, the constructor handles it.

    public void setId(long id) {
        // This setter is primarily for the DAO layer to set the ID after insertion.
        // It's not part of typical public API for domain objects, but necessary for DB sync.
        if (this.id != 0 && this.id != id) {
            throw new IllegalStateException("Employee ID cannot be changed once set (unless it's 0).");
        }
        this.id = id;
    }

    public void setFirstName(String firstName) {
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name cannot be null or empty.");
        }
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Last name cannot be null or empty.");
        }
        this.lastName = lastName;
    }

    public void setDepartment(String department) {
        this.department = department; // Department can be null
    }

    // --- Employee-specific Methods for in-memory punch management ---
    /**
     * Adds a new punch event to the employee's in-memory record.
     * Note: This does NOT save the punch to the database. The PunchService
     * is responsible for database persistence.
     * @param punch The Punch object to add.
     * @throws IllegalArgumentException if the punch is null or belongs to a different employee.
     */
    public void addPunch(Punch punch) {
        if (punch == null) {
            throw new IllegalArgumentException("Punch cannot be null.");
        }
        // Ensure the punch belongs to this employee (by comparing employee IDs)
        if (this.id != 0 && punch.getEmployeeId() != this.id) {
            throw new IllegalArgumentException("Punch's employee ID does not match this employee.");
        }
        this.punches.add(punch);
        // Keep punches sorted by timestamp for easy retrieval of last punch
        punches.sort(Comparator.comparing(Punch::getTimestamp));
    }

    /**
     * Returns the most recent punch (in or out) for this employee from the in-memory list.
     * @return The last Punch object, or null if no punches exist.
     */
    public Punch getLastPunch() {
        if (punches.isEmpty()) {
            return null;
        }
        return punches.get(punches.size() - 1); // List is kept sorted by timestamp
    }

    /**
     * Determines if the employee is currently clocked in based on the last punch type.
     * @return true if the last punch was an 'IN' punch, false otherwise.
     */
    public boolean isClockedIn() {
        Punch lastPunch = getLastPunch();
        return lastPunch != null && "IN".equals(lastPunch.getPunchType());
    }

    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", department='" + department + '\'' +
                ", totalPunches=" + punches.size() +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        // For equals, we consider employees equal if their database IDs match.
        // If IDs are 0 (not yet persisted), then compare by name.
        if (id != 0 && employee.id != 0) {
            return id == employee.id;
        }
        return Objects.equals(firstName, employee.firstName) &&
                Objects.equals(lastName, employee.lastName);
    }

    @Override
    public int hashCode() {
        // If ID is set, use it for hash code. Otherwise, use name.
        return id != 0 ? Objects.hash(id) : Objects.hash(firstName, lastName);
    }
}
