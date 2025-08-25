package app.model;

import jakarta.persistence.*;
import java.time.LocalDate; // Import LocalDate for hireDate, assuming it will be added later
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    // --- NEW FIELDS ADDED HERE ---
    @Column(nullable = false, unique = true) // Email should be unique and not null
    private String email;

    @Column(name = "contact_number") // Explicit column name for phone number
    private String contactNumber;

    @Column(name = "address") // Explicit column name for address
    private String address;

    @Column(name = "hire_date") // Assuming hireDate will be part of the Employee entity
    private LocalDate hireDate;

    @Column(name = "position") // Add this column mapping
    private String position;
    // --- END NEW FIELDS ---


    @Column(name = "department")
    private String department;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Punch> punches = new ArrayList<>();

    public Employee() {
    }

    // Updated constructor to include new fields.
    // Ensure you use the correct constructor when creating new Employee objects.
    public Employee(String firstName, String lastName, String email, String department, String position, String contactNumber, String address, LocalDate hireDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email; // Initialize new field
        this.department = department;
        this.position = position;
        this.contactNumber = contactNumber; // Initialize new field
        this.address = address; // Initialize new field
        this.hireDate = hireDate; // Initialize new field
    }

    // You can keep your other constructors if they are still used,
    // but consider if they lead to partially initialized Employee objects.
    // For a robust system, having one main constructor or using a builder pattern is often better.
    public Employee(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = null;
    }

    public Employee(String firstName, String lastName, String department) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
    }

    public Employee(Long id, String firstName, String lastName, String department) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
    }


    // --- Getters ---
    public Long getId() {
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

    // --- NEW GETTERS ---
    public String getEmail() {
        return email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public String getAddress() {
        return address;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public String getPosition() {
        return position;
    }
    // --- END NEW GETTERS ---

    public List<Punch> getPunches() {
        return this.punches;
    }

    // --- Setters ---
    public void setId(Long id) {
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
        this.department = department;
    }

    // --- NEW SETTERS ---
    public void setEmail(String email) {
        // You might add validation here if needed, e.g., for format
        this.email = email;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public void setPosition(String position) {
        this.position = position;
    }
    // --- END NEW SETTERS ---


    public void addPunch(Punch punch) {
        if (punch == null) {
            throw new IllegalArgumentException("Punch cannot be null.");
        }
        punch.setEmployee(this);
        this.punches.add(punch);
        this.punches.sort(Comparator.comparing(Punch::getTimestamp));
    }

    public void removePunch(Punch punch) {
        if (punch == null) {
            throw new IllegalArgumentException("Punch cannot be null.");
        }
        if (this.punches.remove(punch)) {
            punch.setEmployee(null);
        }
    }

    public Punch getLastPunch() {
        if (punches.isEmpty()) {
            return null;
        }
        return punches.get(punches.size() - 1);
    }

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
                ", email='" + email + '\'' + // Include email in toString
                ", department='" + department + '\'' +
                ", contactNumber='" + contactNumber + '\'' + // Include contactNumber
                ", address='" + address + '\'' +             // Include address
                ", hireDate=" + hireDate +                   // Include hireDate
                ", totalPunches=" + punches.size() +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return id != null && Objects.equals(id, employee.id);
    }

    @Override
    public int hashCode() {
        return id != null ? Objects.hash(id) : Objects.hash(firstName, lastName, email); // Include email in hashCode
    }
}