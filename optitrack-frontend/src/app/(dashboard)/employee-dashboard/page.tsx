"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    UserCheck,
    UserX,
    AlertCircle,
    CheckCircle,
    LogOut,
    User,
    DollarSign,
    Timer,
    Loader2, // Added for explicit loading spinner
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import Link from "next/link"; // For better date formatting

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081";

// --- UPDATED INTERFACES ---
interface EmployeeDashboardStats {
    employeeId: number;
    employeeFullName: string;
    department: string;
    role: string;
    todayHours: string; // Backend sends as formatted string
    weeklyHours: string; // Backend sends as formatted string
    currentStatus: string; // e.g., "Clocked In", "Clocked Out", "Not Clocked In"
    lastPunchTime: string | null; // ISO string or null
    recentPunches: Array<{
        id: number;
        timestamp: string;
        punchType: "IN" | "OUT";
    }>;
    pendingEmployeeOvertimeRequests: number;
}

// Consolidated and consistent Auth User interface
interface AuthenticatedUser {
    id: number; // User entity ID
    email: string;
    role: string;
    employeeId?: number; // Employee entity ID, critical for employee role
    firstName?: string;
    lastName?: string;
    department?: string;
    authToken: string; // The JWT token
}

// --- Helper Functions (Auth, Token) ---
const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

// Centralized function to get authenticated user details (consistent across pages)
const getAuthUser = async (): Promise<AuthenticatedUser | null> => {
    if (typeof window === "undefined") {
        return null;
    }

    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(
                "Failed to fetch user info from /api/auth/me:",
                response.status,
                await response.text()
            );
            // Clear token if it's invalid
            localStorage.removeItem("authToken");
            return null;
        }

        const userData = await response.json(); // Expected: {id, email, role, employeeId, firstName, lastName, department}

        if (userData.id && userData.role && userData.email) {
            // Store relevant employee details in localStorage for quick access if not already there
            localStorage.setItem("userRole", userData.role);
            localStorage.setItem("employeeId", userData.employeeId ? String(userData.employeeId) : '');
            localStorage.setItem("firstName", userData.firstName || '');
            localStorage.setItem("lastName", userData.lastName || '');
            localStorage.setItem("department", userData.department || '');

            return {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                employeeId: userData.employeeId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                department: userData.department,
                authToken: token,
            };
        } else {
            console.error("/api/auth/me did not return expected user fields:", userData);
            return null;
        }
    } catch (error) {
        console.error("Error fetching auth user from API:", error);
        return null;
    }
};


export default function EmployeeDashboard() {
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null); // Renamed user to currentUser for clarity
    const [employeeDashboardData, setEmployeeDashboardData] = useState<EmployeeDashboardStats | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoadingPage, setIsLoadingPage] = useState(true); // Tracks overall page loading
    const [isPunching, setIsPunching] = useState(false); // Tracks only punch button state
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    // Fetch Employee Dashboard Data - now takes employeeId as argument
    const fetchEmployeeDashboardData = useCallback(async (employeeId: number) => {
        setError(null); // Clear previous errors
        const token = getToken();

        if (!token) {
            setError("Authentication token missing. Please log in again.");
            return; // Early exit, parent useEffect will handle redirect
        }

        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/employee/dashboard/stats/${employeeId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch employee dashboard data: ${response.statusText}`);
            }

            const data: EmployeeDashboardStats = await response.json();
            setEmployeeDashboardData(data);
            console.log("Employee Dashboard Data fetched:", data);
            console.log("Current Status from backend:", data.currentStatus);
        } catch (err) {
            console.error("Error fetching employee dashboard data:", err);
            setError(err instanceof Error ? err.message : "An error occurred while loading dashboard data.");
        }
    }, [toast]); // Dependencies for useCallback

    // Initial load and authentication check
    useEffect(() => {
        const loadPage = async () => {
            setIsLoadingPage(true); // Start overall page loading

            const authUser = await getAuthUser(); // Get authenticated user details

            if (!authUser || authUser.role.toUpperCase() !== "EMPLOYEE" || !authUser.employeeId) {
                toast({
                    id: "employee-dashboard-error",
                    title: "Access Denied",
                    description: "This page is for employees with assigned punch cards only. Please ensure you are logged in as an employee with an assigned employee ID.",
                    variant: "destructive",
                });
                localStorage.removeItem("authToken"); // Clear potentially invalid token
                router.push("/login");
                setIsLoadingPage(false);
                return;
            }

            setCurrentUser(authUser); // Set the current authenticated user

            // Fetch dashboard data ONLY AFTER successful authentication and employeeId check
            await fetchEmployeeDashboardData(authUser.employeeId);
            setIsLoadingPage(false); // End overall page loading
        };

        loadPage();
    }, [router, toast, fetchEmployeeDashboardData]); // Depend on fetchEmployeeDashboardData

    // Real-time clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        console.log("Current isPunching state:", isPunching);
        return () => clearInterval(timer);
    }, [isPunching]);

    // Handle Clock In/Out
// Handle Clock In/Out
    const handlePunch = async (punchType: "IN" | "OUT") => {
        if (!currentUser || !currentUser.employeeId) {
            toast({
                id: "employee-dashboard-error",
                title: "Error",
                description: "Employee ID not available. Please log in.",
                variant: "destructive",
            });
            return;
        }

        setIsPunching(true); // Start punching specific loading
        setError(null); // Clear previous errors related to punching

        const token = getToken(); // Get the token directly for the punch call

        if (!token) {
            toast({
                id: "employee-dashboard-error",
                title: "Error",
                description: "Authentication token missing. Please log in.",
                variant: "destructive",
            });
            setIsPunching(false);
            router.push("/login");
            return;
        }

        // --- CRITICAL CHANGE HERE ---
        const punchEndpoint = `${BACKEND_API_BASE_URL}/api/punches/${punchType.toLowerCase()}`; // Dynamically set /in or /out
        // --- END CRITICAL CHANGE ---

        try {
            const response = await fetch(punchEndpoint, { // Use the dynamically determined endpoint
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, // Use the retrieved token
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeId: currentUser.employeeId, // Use currentUser.employeeId
                    // punchType: punchType, // No longer needed in body as it's in the URL
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to record punch: ${response.statusText}`);
            }

            toast({
                id: "employee-dashboard-success",
                title: `${punchType === "IN" ? "Clock-in" : "Clock-out"} Successful!`,
                description: `Employee ${currentUser.employeeId} clocked ${punchType.toLowerCase()} at ${new Date().toLocaleTimeString()}`,
            });
            // Re-fetch dashboard data to update UI after a successful punch
            await fetchEmployeeDashboardData(currentUser.employeeId); // Pass employeeId
        } catch (err) {
            console.error("Error recording punch:", err);
            toast({
                id: "employee-dashboard-error",
                title: "Punch Error",
                description: err instanceof Error ? err.message : "An error occurred while punching.",
                variant: "destructive",
            });
        } finally {
            setIsPunching(false); // End punching specific loading
        }
    };

    const handleClockIn = () => handlePunch("IN");
    const handleClockOut = () => handlePunch("OUT");

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("department");
        router.push("/login");
    };

    if (isLoadingPage) { // Show full page loader if data is being fetched initially
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p>Loading employee dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) { // Show error if there's a problem fetching data
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // After loading, if currentUser is null (e.g., redirect happened before render, or data problem)
    if (!currentUser || !employeeDashboardData) { // If currentUser or dashboard data is missing after loading
        // This case should ideally be caught by isLoadingPage and error states,
        // but as a fallback, we can redirect or show an unhandled error.
        // For now, let's assume it means a critical failure in initial load.
        // A more robust app might show a "Something went wrong" message with a retry.
        router.push("/login"); // Fallback redirect if something went wrong and data isn't there
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div>
                                    <h1 className="text-xl font-heading">Employee Portal</h1>
                                    <p className="text-sm text-muted-foreground font-body">
                                        Welcome, {employeeDashboardData.employeeFullName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-lg font-mono font-bold">{currentTime.toLocaleTimeString()}</div>
                                <div className="text-xs text-muted-foreground">{currentTime.toLocaleDateString()}</div>
                            </div>
                            <Button variant="outline" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* User Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-heading">
                            <User className="h-5 w-5" />
                            Your Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                                <p className="font-medium">{employeeDashboardData.employeeId}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                                <p className="font-medium">{employeeDashboardData.department || currentUser.department || "N/A"}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                                <Badge variant="secondary" className="capitalize">
                                    {employeeDashboardData.role || currentUser.role}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employee Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            {employeeDashboardData.currentStatus.includes("Clocked In") ? (
                                <UserCheck className="h-4 w-4 text-green-600" />
                            ) : (
                                <UserX className="h-4 w-4 text-red-600" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {employeeDashboardData.currentStatus}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {employeeDashboardData.lastPunchTime
                                    ? `Last punched: ${format(parseISO(employeeDashboardData.lastPunchTime), 'MMM d, yyyy h:mm:ss a')}`
                                    : "No recent punch"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{employeeDashboardData.todayHours}</div>
                            <p className="text-xs text-muted-foreground">Hours worked today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
                            <Timer className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{employeeDashboardData.weeklyHours}</div>
                            <p className="text-xs text-muted-foreground">Total hours this week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Overtime</CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{employeeDashboardData.pendingEmployeeOvertimeRequests}</div>
                            <p className="text-xs text-muted-foreground">Requests awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Overtime Access */}
                <Card className="card-hover border-0 shadow-modern">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-heading">
                            My Overtime
                        </CardTitle>
                        <CardDescription className="font-body">
                            View your overtime hours, submit requests, and track earnings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/employee-dashboard/employee-overtime">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                View Overtime
                            </Button>
                        </Link>
                    </CardContent>
                </Card>


                {/* Clock In/Out System */}
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-display text-balance">Time Punch System</CardTitle>
                        <CardDescription className="font-body">
                            Clock in when you start work, clock out when you finish
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input id="employeeId" value={employeeDashboardData.employeeId} className="text-center text-lg" disabled />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={handleClockIn}
                                disabled={isPunching || employeeDashboardData.currentStatus === "Clocked In"}
                                size="lg"
                                className="h-16 text-lg bg-green-600 hover:bg-green-700"
                            >
                                <UserCheck className="mr-2 h-6 w-6" />
                                {isPunching ? "Processing..." : "Clock In"}
                            </Button>

                            <Button
                                onClick={handleClockOut}
                                disabled={isPunching || employeeDashboardData.currentStatus === "Not Clocked In" || employeeDashboardData.currentStatus === "Clocked Out"}
                                size="lg"
                                variant="destructive"
                                className="h-16 text-lg"
                            >
                                <UserX className="mr-2 h-6 w-6" />
                                {isPunching ? "Processing..." : "Clock Out"}
                            </Button>
                        </div>

                        {employeeDashboardData.lastPunchTime && (
                            <Alert className={employeeDashboardData.currentStatus.includes("Clocked In") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                                <CheckCircle className={`h-4 w-4 ${employeeDashboardData.currentStatus.includes("Clocked In") ? "text-green-600" : "text-red-600"}`} />
                                <AlertDescription className="font-medium">
                                    Last Action: Employee {employeeDashboardData.employeeId} clocked{" "}
                                    {employeeDashboardData.currentStatus.includes("Clocked In") ? "in" : "out"} at{" "}
                                    {format(parseISO(employeeDashboardData.lastPunchTime), 'h:mm:ss a')}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Instructions:</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Click "Clock In" when starting your shift</li>
                                    <li>• Click "Clock Out" when ending your shift</li>
                                    <li>• You will receive confirmation of each action</li>
                                    <li>• Contact your supervisor if you have any issues</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Recent Punches */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Recent Punches</CardTitle>
                        <CardDescription>Your latest clock in/out records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {employeeDashboardData.recentPunches.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="mx-auto h-12 w-12 mb-4" />
                                <p>No punch records found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {employeeDashboardData.recentPunches.map((punch) => (
                                    <div key={punch.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-2 rounded-full ${punch.punchType === "IN" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                                            >
                                                {punch.punchType === "IN" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{punch.punchType === "IN" ? "Clock In" : "Clock Out"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(parseISO(punch.timestamp), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={punch.punchType === "IN" ? "default" : "secondary"}>
                                                {format(parseISO(punch.timestamp), 'h:mm:ss a')}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}