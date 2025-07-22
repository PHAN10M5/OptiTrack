package app.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class Punch {
    private long id; // Database ID, 0 for new punches not yet saved
    private long employeeId; // Foreign key to Employee
    private final String punchType; // "IN" or "OUT"
    private final LocalDateTime timestamp;

    // Constructor for creating new Punch objects (before saving to DB)
    public Punch(long employeeId, String punchType, LocalDateTime timestamp) {
        this(0, employeeId, punchType, timestamp); // Calls the full constructor with default ID
    }

    // Full constructor, typically used when loading from the database
    public Punch(long id, long employeeId, String punchType, LocalDateTime timestamp) {
        // Input validation
        if (employeeId <= 0) { // Employee ID must be a valid positive ID from DB
            throw new IllegalArgumentException("Employee ID must be a positive value.");
        }
        if (!"IN".equals(punchType) && !"OUT".equals(punchType)) {
            throw new IllegalArgumentException("Punch type must be 'IN' or 'OUT'.");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null.");
        }

        this.id = id;
        this.employeeId = employeeId;
        this.punchType = punchType;
        this.timestamp = timestamp;
    }

    // --- Getters ---
    public long getId() {
        return id;
    }

    public long getEmployeeId() {
        return employeeId;
    }

    public String getPunchType() {
        return punchType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // --- Setter for ID (primarily for DAO after DB insertion) ---
    public void setId(long id) {
        // This setter is primarily for the DAO layer to set the ID after insertion.
        // It's not part of typical public API for domain objects, but necessary for DB sync.
        if (this.id != 0 && this.id != id) {
            throw new IllegalStateException("Punch ID cannot be changed once set (unless it's 0).");
        }
        this.id = id;
    }

    // No setters for core attributes (employeeId, punchType, timestamp) as Punch objects are immutable once created.
    // A punch represents a historical event; it shouldn't be modified after creation.

    @Override
    public String toString() {
        return "Punch{" +
                "id=" + id +
                ", employeeId=" + employeeId +
                ", punchType='" + punchType + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Punch punch = (Punch) o;
        // For equals, we consider punches equal if their database IDs match.
        // If IDs are 0 (not yet persisted), then compare by all attributes.
        if (id != 0 && punch.id != 0) {
            return id == punch.id;
        }
        return employeeId == punch.employeeId &&
                Objects.equals(punchType, punch.punchType) &&
                Objects.equals(timestamp, punch.timestamp);
    }

    @Override
    public int hashCode() {
        // If ID is set, use it for hash code. Otherwise, use all attributes.
        return id != 0 ? Objects.hash(id) : Objects.hash(employeeId, punchType, timestamp);
    }
}

