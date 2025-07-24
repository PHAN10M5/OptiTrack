// src/api/api.ts
import axios from 'axios';
import {
    Employee,
    Punch,
    OvertimeRequest,
    CreateEmployeePayload,
    UpdateEmployeePayload,
    PunchPayload,
    CreateOvertimeRequestPayload
} from '@/types'; // Adjust path if your types are elsewhere

// Use the environment variable for the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!API_BASE_URL) {
    console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined. Please check your .env.local file.");
    // Fallback or throw an error to prevent app from running without API URL
    throw new Error("Backend API URL is not configured.");
}


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Employee API ---
export const getEmployees = async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
};

export const createEmployee = async (payload: CreateEmployeePayload): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', payload);
    return response.data;
};

export const updateEmployee = async (id: number, payload: UpdateEmployeePayload): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, payload);
    return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
};

// --- Punch API ---
export const clockIn = async (payload: PunchPayload): Promise<Punch> => {
    const response = await api.post<Punch>('/punches/in', payload);
    return response.data;
};

export const clockOut = async (payload: PunchPayload): Promise<Punch> => {
    const response = await api.post<Punch>('/punches/out', payload);
    return response.data;
};

export const getPunchesByEmployeeId = async (employeeId: number): Promise<Punch[]> => {
    const response = await api.get<Punch[]>(`/punches/employee/${employeeId}`);
    return response.data;
};

export const calculateHoursWorked = async (employeeId: number, startTime: string, endTime: string): Promise<number> => {
    const response = await api.get<number>(`/punches/employee/${employeeId}/hours`, {
        params: { startTime, endTime }
    });
    return response.data;
};

// --- Overtime Request API ---
export const createOvertimeRequest = async (payload: CreateOvertimeRequestPayload): Promise<OvertimeRequest> => {
    const response = await api.post<OvertimeRequest>('/overtime-requests', payload);
    return response.data;
};

export const getOvertimeRequests = async (): Promise<OvertimeRequest[]> => {
    const response = await api.get<OvertimeRequest[]>('/overtime-requests');
    return response.data;
};

export const getOvertimeRequestById = async (id: number): Promise<OvertimeRequest> => {
    const response = await api.get<OvertimeRequest>(`/overtime-requests/${id}`);
    return response.data;
};

export const getOvertimeRequestsByEmployeeId = async (employeeId: number): Promise<OvertimeRequest[]> => {
    const response = await api.get<OvertimeRequest[]>(`/overtime-requests/employee/${employeeId}`);
    return response.data;
};

export const updateOvertimeRequestStatus = async (id: number, newStatus: string): Promise<OvertimeRequest> => {
    // Note: Backend expects a plain string for status update, not a JSON object
    const response = await api.put<OvertimeRequest>(`/overtime-requests/${id}/status`, newStatus, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
};

export const deleteOvertimeRequest = async (id: number): Promise<void> => {
    await api.delete(`/overtime-requests/${id}`);
};
