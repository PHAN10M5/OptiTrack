package app.model;

import java.time.LocalDateTime;

public class OvertimeRequest {
    private long id;
    private long employeeId;
    private LocalDateTime requestDateTime;
    private double requestedHours;
    private String status; // e.g., PENDING, APPROVED, REJECTED
    private String reason;

    // Constructors
    public OvertimeRequest() {
        this.status = "PENDING"; // Default status
    }

    public OvertimeRequest(long employeeId, LocalDateTime requestDateTime, double requestedHours, String reason) {
        this.employeeId = employeeId;
        this.requestDateTime = requestDateTime;
        this.requestedHours = requestedHours;
        this.reason = reason;
        this.status = "PENDING"; // Default status
    }

    public OvertimeRequest(long id, long employeeId, LocalDateTime requestDateTime, double requestedHours, String status, String reason) {
        this.id = id;
        this.employeeId = employeeId;
        this.requestDateTime = requestDateTime;
        this.requestedHours = requestedHours;
        this.status = status;
        this.reason = reason;
    }

    // Getters
    public long getId() {
        return id;
    }

    public long getEmployeeId() {
        return employeeId;
    }

    public LocalDateTime getRequestDateTime() {
        return requestDateTime;
    }

    public double getRequestedHours() {
        return requestedHours;
    }

    public String getStatus() {
        return status;
    }

    public String getReason() {
        return reason;
    }

    // Setters
    public void setId(long id) {
        this.id = id;
    }

    public void setEmployeeId(long employeeId) {
        this.employeeId = employeeId;
    }

    public void setRequestDateTime(LocalDateTime requestDateTime) {
        this.requestDateTime = requestDateTime;
    }

    public void setRequestedHours(double requestedHours) {
        this.requestedHours = requestedHours;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    @Override
    public String toString() {
        return "OvertimeRequest{" +
                "id=" + id +
                ", employeeId=" + employeeId +
                ", requestDateTime=" + requestDateTime +
                ", requestedHours=" + requestedHours +
                ", status='" + status + '\'' +
                ", reason='" + reason + '\'' +
                '}';
    }
}
