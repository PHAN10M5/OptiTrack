// src/main/java/app/dto/PunchRecordDto.java
package app.dto;

import java.time.LocalDateTime;

public class PunchRecordDto {
    private Long id;
    private Long employeeId;
    private String punchType; // "IN" or "OUT"
    private LocalDateTime timestamp;

    // Constructors
    public PunchRecordDto() {
    }

    public PunchRecordDto(Long id, Long employeeId, String punchType, LocalDateTime timestamp) {
        this.id = id;
        this.employeeId = employeeId;
        this.punchType = punchType;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getPunchType() {
        return punchType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public void setPunchType(String punchType) {
        this.punchType = punchType;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
