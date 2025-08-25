package app.model;

import jakarta.persistence.*;
import java.time.LocalDate; // <-- Add this import
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "overtime_requests")
public class OvertimeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "request_date_time", nullable = false)
    private LocalDateTime requestDateTime;

    @Column(name = "overtime_date", nullable = false) // <-- NEW FIELD for the specific date of overtime
    private LocalDate overtimeDate;

    @Column(name = "requested_hours", nullable = false)
    private double requestedHours;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "reason", length = 500)
    private String reason;

    public OvertimeRequest() {
        this.status = "PENDING";
    }

    // Updated constructor to include overtimeDate
    public OvertimeRequest(Employee employee, LocalDateTime requestDateTime, LocalDate overtimeDate, double requestedHours, String reason) {
        this.employee = employee;
        this.requestDateTime = requestDateTime;
        this.overtimeDate = overtimeDate; // Initialize new field
        this.requestedHours = requestedHours;
        this.reason = reason;
        this.status = "PENDING";
    }

    // Full constructor (for loading from DB or complete creation)
    public OvertimeRequest(Long id, Employee employee, LocalDateTime requestDateTime, LocalDate overtimeDate, double requestedHours, String status, String reason) {
        this.id = id;
        this.employee = employee;
        this.requestDateTime = requestDateTime;
        this.overtimeDate = overtimeDate; // Initialize new field
        this.requestedHours = requestedHours;
        this.status = status;
        this.reason = reason;
    }

    // --- Getters ---
    public Long getId() { return id; }
    public Employee getEmployee() { return employee; }
    public Long getEmployeeId() { return employee != null ? employee.getId() : null; }
    public LocalDateTime getRequestDateTime() { return requestDateTime; }
    public LocalDate getOvertimeDate() { return overtimeDate; } // <-- NEW GETTER
    public double getRequestedHours() { return requestedHours; }
    public String getStatus() { return status; }
    public String getReason() { return reason; }

    // --- Setters ---
    public void setId(Long id) { this.id = id; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public void setRequestDateTime(LocalDateTime requestDateTime) { this.requestDateTime = requestDateTime; }
    public void setOvertimeDate(LocalDate overtimeDate) { this.overtimeDate = overtimeDate; } // <-- NEW SETTER
    public void setRequestedHours(double requestedHours) { this.requestedHours = requestedHours; }
    public void setStatus(String status) { this.status = status; }
    public void setReason(String reason) { this.reason = reason; }

    @Override
    public String toString() {
        return "OvertimeRequest{" +
                "id=" + id +
                ", employeeId=" + (employee != null ? employee.getId() : "null") +
                ", requestDateTime=" + requestDateTime +
                ", overtimeDate=" + overtimeDate +
                ", requestedHours=" + requestedHours +
                ", status='" + status + '\'' +
                ", reason='" + reason + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OvertimeRequest that = (OvertimeRequest) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? Objects.hash(id) : Objects.hash(employee, requestDateTime, overtimeDate);
    }
}