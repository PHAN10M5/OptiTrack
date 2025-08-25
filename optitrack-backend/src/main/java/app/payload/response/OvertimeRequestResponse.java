package app.payload.response;

import app.model.OvertimeRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

public class OvertimeRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeFullName;
    private String employeeEmail;
    private LocalDateTime requestDateTime;
    private LocalDate overtimeDate;
    private double requestedHours;
    private String status;
    private String reason;

    public OvertimeRequestResponse(OvertimeRequest overtimeRequest) {
        this.id = overtimeRequest.getId();
        this.requestDateTime = overtimeRequest.getRequestDateTime();
        this.overtimeDate = overtimeRequest.getOvertimeDate();
        this.requestedHours = overtimeRequest.getRequestedHours();
        this.status = overtimeRequest.getStatus();
        this.reason = overtimeRequest.getReason();

        if (overtimeRequest.getEmployee() != null) {
            this.employeeId = overtimeRequest.getEmployee().getId();
            this.employeeFullName = overtimeRequest.getEmployee().getFullName();
            this.employeeEmail = overtimeRequest.getEmployee().getEmail();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeFullName() { return employeeFullName; }
    public void setEmployeeFullName(String employeeFullName) { this.employeeFullName = employeeFullName; }
    public String getEmployeeEmail() { return employeeEmail; }
    public void setEmployeeEmail(String employeeEmail) { this.employeeEmail = employeeEmail; }
    public LocalDateTime getRequestDateTime() { return requestDateTime; }
    public void setRequestDateTime(LocalDateTime requestDateTime) { this.requestDateTime = requestDateTime; }
    public LocalDate getOvertimeDate() { return overtimeDate; }
    public void setOvertimeDate(LocalDate overtimeDate) { this.overtimeDate = overtimeDate; }
    public double getRequestedHours() { return requestedHours; }
    public void setRequestedHours(double requestedHours) { this.requestedHours = requestedHours; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
