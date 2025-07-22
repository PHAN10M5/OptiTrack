"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, UserCheck, UserX, Plus, Timer, ClockIcon, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Import useToast for error messages

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"; // Ensure this matches your Spring Boot app's port

// Updated: Define interfaces for expected data structure from backend for Admin Dashboard
interface AdminDashboardStats {
    totalEmployees: number;
    employeesClockedIn: number;
    pendingOvertimeRequests: number;
    totalHoursAcrossAllEmployeesToday: string; // From backend: formatted as string
}

interface RecentActivityItem {
    id: number; // Ensure this matches backend 'id' type
    employeeName: string;
    punchType: 'IN' | 'OUT';
    timestamp: string; // ISO string from backend
}

// Re-using the AuthenticatedUser interface from PunchPage.tsx for consistency
interface AuthenticatedUser {
    id: number;
    email?: string;
    role: string;
    employeeId: number | null;
    name?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
}

// Utility to get the token (re-used for consistency)
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken'); // Ensure this matches your LoginPage's key
    }
    return null;
};

// Utility to get authenticated user details (re-used for consistency)
const getAuthUser = async (token: string): Promise<AuthenticatedUser | null> => {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedUser = localStorage.getItem('currentUser');
    const storedRole = localStorage.getItem('userRole');
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedUser && storedRole && storedEmployeeId) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id && parsedUser.role && (parsedUser.employeeId || storedEmployeeId)) {
                return {
                    id: parsedUser.id,
                    email: parsedUser.email || "",
                    role: parsedUser.role,
                    employeeId: parseInt(storedEmployeeId),
                    name: parsedUser.name,
                    firstName: parsedUser.firstName,
                    lastName: parsedUser.lastName,
                    department: parsedUser.department,
                };
            }
        } catch (e) {
            console.error("Error parsing stored user data from localStorage:", e);
        }
    }

    // Fallback to API call if no valid user in localStorage
    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch user info from /api/auth/me:", response.status, await response.text());
            return null;
        }

        const userData: AuthenticatedUser = await response.json();
        if (userData.id && userData.role && (userData.employeeId !== undefined)) {
            return userData;
        } else {
            console.error("/api/auth/me did not return expected user fields:", userData);
            return null;
        }
    } catch (error) {
        console.error("Error fetching auth user from API:", error);
        return null;
    }
};


export default function AdminDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState<AuthenticatedUser | null>(null); // Use AuthenticatedUser interface
    const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivityItem[] | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast(); // Initialize useToast

    // --- Authentication and User Data Fetch (Replaces getUserInfo & initial useEffect) ---
    useEffect(() => {
        const authenticateAndFetchUser = async () => {
            setIsLoadingData(true);
            setError(null);

            const token = getToken();
            if (!token) {
                console.error("No token found. Redirecting to login.");
                router.push("/login");
                return;
            }

            const authenticatedUser = await getAuthUser(token);
            if (!authenticatedUser) {
                console.error("Authentication failed for user data. Redirecting to login.");
                toast({
                    id: "authentication-error",
                    title: "Authentication Error",
                    description: "Your session has expired or is invalid. Please log in again.",
                    variant: "destructive",
                });
                localStorage.removeItem('authToken'); // Clear potentially bad token
                router.push("/login");
                return;
            }

            // Check if user has ADMIN role
            if (authenticatedUser.role.toUpperCase() !== "ADMIN") { // Ensure case-insensitive comparison or match backend exact
                console.error("Access denied: User is not an ADMIN. Redirecting.");
                toast({
                    id: "access-denied",
                    title: "Access Denied",
                    description: "You do not have administrative privileges to view this page.",
                    variant: "destructive",
                });
                router.push("/employee-dashboard");
                return;
            }

            setUser(authenticatedUser); // Set the authenticated user

            // --- Fetch Dashboard Data (only if authenticated and admin) ---
            try {
                // Fetch Dashboard Stats
                const statsResponse = await fetch(`${BACKEND_API_BASE_URL}/api/admin/dashboard/stats`, {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Send token
                    },
                });
                if (!statsResponse.ok) {
                    const errorText = await statsResponse.text();
                    throw new Error(`Failed to fetch dashboard stats: ${errorText || statsResponse.statusText}`);
                }
                const statsData: AdminDashboardStats = await statsResponse.json();
                setDashboardStats(statsData);

                // Fetch Recent Activity
                const activityResponse = await fetch(`${BACKEND_API_BASE_URL}/api/admin/dashboard/recent-activity?limit=10`, {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Send token
                    },
                });
                if (!activityResponse.ok) {
                    const errorText = await activityResponse.text();
                    throw new Error(`Failed to fetch recent activity: ${errorText || activityResponse.statusText}`);
                }
                const activityData: RecentActivityItem[] = await activityResponse.json();
                setRecentActivity(activityData);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "An error occurred while loading dashboard data.");
                toast({
                    id: "dashboard-load-error",
                    title: "Dashboard Load Error",
                    description: err.message || "Failed to load dashboard data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        authenticateAndFetchUser();
    }, [router, toast]); // Removed 'user' from dependency array to prevent re-fetching loop on user state change

    // --- Current Time Effect (remains unchanged) ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);


    if (!user || isLoadingData) { // Check user for initial loading state
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) { // Only show error if an error occurred during data fetch
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display text-balance mb-2">Welcome back, {user.name || user.email}! 👋</h1> {/* Use user.name or user.email */}
                        <p className="text-muted-foreground font-body text-lg">Here's what's happening with your team today</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-blue-600">{currentTime.toLocaleTimeString()}</div>
                        <div className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="card-hover border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Clock In/Out</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin-dashboard/punch-logs">
                            <Button className="w-full" size="sm">
                                Go to Punch System
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="card-hover border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Add Employee</CardTitle>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin-dashboard/employees/add"> {/* Corrected path if needed */}
                            <Button variant="outline" className="w-full bg-transparent" size="sm">
                                Add New Employee
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="card-hover border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overtime</CardTitle>
                        <ClockIcon className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin-dashboard/overtime">
                            <Button variant="outline" className="w-full bg-transparent" size="sm">
                                Manage Overtime
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="card-hover border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">View Reports</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin-dashboard/reports"> {/* Corrected path if needed */}
                            <Button variant="outline" className="w-full bg-transparent" size="sm">
                                Generate Reports
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="card-hover border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Manage Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin-dashboard/employees">
                            <Button variant="outline" className="w-full bg-transparent" size="sm">
                                View All Employees
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics */}
            {dashboardStats && (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Card className="border-0 shadow-modern">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalEmployees}</div>
                            <p className="text-xs text-muted-foreground">Active employees</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-modern">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clocked In</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{dashboardStats.employeesClockedIn}</div>
                            <p className="text-xs text-muted-foreground">Currently working</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-modern">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Overtime</CardTitle>
                            <ClockIcon className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{dashboardStats.pendingOvertimeRequests}</div>
                            <p className="text-xs text-muted-foreground">Requests awaiting approval</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-modern">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalHoursAcrossAllEmployeesToday}</div>
                            <p className="text-xs text-muted-foreground">Company-wide</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Activity - Now active again */}
            {recentActivity && (
                <Card className="border-0 shadow-modern">
                    <CardHeader>
                        <CardTitle className="font-heading">Recent Activity</CardTitle>
                        <CardDescription className="font-body">Latest clock in/out events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-2 rounded-full ${activity.punchType === "IN" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                                            >
                                                {activity.punchType === "IN" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{activity.employeeName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.punchType === "IN" ? "Clocked In" : "Clocked Out"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={activity.punchType === "IN" ? "default" : "secondary"}>
                                            {new Date(activity.timestamp).toLocaleTimeString()}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground">No recent activity to display.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}