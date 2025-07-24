// src/types/index.ts

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    department: string | null;
}

export interface Punch {
    id: number;
    employeeId: number;
    punchType: 'IN' | 'OUT';
    timestamp: string; // ISO 8601 string (e.g., "2023-07-17T10:30:00")
}

export interface OvertimeRequest {
    id: number;
    employeeId: number;
    requestDateTime: string; // ISO 8601 string
    requestedHours: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string | null;
}

// For API request bodies
export interface CreateEmployeePayload {
    firstName: string;
    lastName: string;
    department?: string | null;
}

export interface UpdateEmployeePayload {
    firstName: string;
    lastName: string;
    department?: string | null;
}

export interface PunchPayload {
    employeeId: number;
}

export interface CreateOvertimeRequestPayload {
    employeeId: number;
    requestDateTime: string; // ISO 8601 string
    requestedHours: number;
    reason?: string | null;
}
