package app.payload.request;

import java.time.LocalDate;

public class OvertimeRequestDTO {
    private LocalDate overtimeDate;
    private double requestedHours;
    private String reason;

    // Getters and Setters
    public LocalDate getOvertimeDate() {
        return overtimeDate;
    }

    public void setOvertimeDate(LocalDate overtimeDate) {
        this.overtimeDate = overtimeDate;
    }

    public double getRequestedHours() {
        return requestedHours;
    }

    public void setRequestedHours(double requestedHours) {
        this.requestedHours = requestedHours;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}