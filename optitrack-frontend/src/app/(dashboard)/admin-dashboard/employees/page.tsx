"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"

// --- UPDATED INTERFACES FOR DATA STRUCTURES ---
// This Employee interface should now match your backend's EmployeeDto
// If you need more fields (like email, contactNumber) to be displayed on this *list* page,
// you MUST update your backend's EmployeeDto and EmployeeService mapping first.
interface EmployeeDisplayDto { // Renamed for clarity to match backend DTO
    id: number
    firstName: string
    lastName: string
    department: string
    // Removed email, contactNumber, address as they are not in backend EmployeeDto for lists
}

interface AuthenticatedUser { // Consistent with PunchLogsPage.tsx
    id: number;
    email: string;
    role: string;
    employeeId?: number;
    firstName?: string;
    lastName?: string;
}

// Consistent getToken and getAuthUser from PunchLogsPage.tsx
const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

const getAuthUser = async (token: string): Promise<AuthenticatedUser | null> => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const storedUser = localStorage.getItem("currentUser");
        const storedRole = localStorage.getItem("userRole");
        const storedEmployeeId = localStorage.getItem("employeeId");
        const storedFirstName = localStorage.getItem("firstName");
        const storedLastName = localStorage.getItem("lastName");

        if (storedUser && storedRole) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id && parsedUser.email && parsedUser.role) {
                return {
                    id: parsedUser.id,
                    email: parsedUser.email,
                    role: storedRole,
                    employeeId: storedEmployeeId ? parseInt(storedEmployeeId) : undefined,
                    firstName: storedFirstName || parsedUser.firstName,
                    lastName: storedLastName || parsedUser.lastName,
                };
            }
        }
    } catch (e) {
        console.error("Error parsing stored user data from localStorage:", e);
    }

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
            return null;
        }

        const userData: AuthenticatedUser = await response.json();
        if (userData.id && userData.role && userData.email) {
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


export default function AdminEmployeesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [employees, setEmployees] = useState<EmployeeDisplayDto[]>([]) // Use the updated interface
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null) // Use AuthenticatedUser interface
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    // --- REVISED fetchEmployees to use the correct DTO and endpoint ---
    const fetchEmployees = useCallback(async (token: string) => {
        setIsLoadingData(true)
        setError(null)
        try {
            // UPDATED: Use the /api/employees/all endpoint as per backend
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/employees/all`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.json() // Attempt to parse JSON error
                throw new Error(errorData.message || `Failed to fetch employee data: ${response.statusText}.`);
            }
            // UPDATED: Expect EmployeeDisplayDto[] (which matches EmployeeDto from backend)
            const data: EmployeeDisplayDto[] = await response.json()
            setEmployees(data)
        } catch (err) {
            console.error("Error fetching employees:", err)
            setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching employees.")
            toast({
                id: "error-fetching-employees",
                title: "Error fetching employees",
                description: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingData(false)
        }
    }, [toast])

    // --- Initial load and authentication check ---
    useEffect(() => {
        const loadPageData = async () => {
            setIsLoadingData(true);
            const token = getToken();

            if (!token) {
                toast({
                    id: "not-authenticated",
                    title: "Not Authenticated",
                    description: "Please log in to manage employees.",
                    variant: "destructive",
                });
                router.push("/login");
                setIsLoadingData(false);
                return;
            }

            const userAuth = await getAuthUser(token);
            if (!userAuth) {
                toast({
                    id: "auth-failed",
                    title: "Authentication Failed",
                    description: "Could not verify user. Please log in again.",
                    variant: "destructive",
                });
                localStorage.removeItem("authToken");
                router.push("/login");
                setIsLoadingData(false);
                return;
            }

            if (userAuth.role.toUpperCase() !== "ADMIN") {
                toast({
                    id: "access-denied",
                    title: "Access Denied",
                    description: "You do not have administrative privileges to manage employees.",
                    variant: "destructive",
                });
                router.push("/employee-dashboard"); // Redirect non-admins
                setIsLoadingData(false);
                return;
            }

            setCurrentUser(userAuth);
            fetchEmployees(token); // Fetch data only after successful authentication
        };

        loadPageData();
    }, [router, toast, fetchEmployees]); // Depend on fetchEmployees

    const handleDeleteEmployee = async (employeeId: number) => {
        const originalEmployees = [...employees];
        setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
        toast({
            id: "delete-optimistic",
            title: "Deleting Employee...",
            description: `Attempting to delete employee ID: ${employeeId}.`,
        });

        try {
            // FIX: Get the token directly from localStorage here
            const token = getToken(); // Use the getToken() helper function

            if (!token) {
                // If token is missing, log the user out or prevent the action
                throw new Error("Authentication token missing. Please log in again.");
            }

            const response = await fetch(`${BACKEND_API_BASE_URL}/api/employees/${employeeId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, // <--- Use the 'token' variable here!
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete employee: ${errorText || response.statusText}`);
            }

            toast({
                id: "delete-success",
                title: "Employee Deleted!",
                description: `Employee ID: ${employeeId} has been successfully deleted.`,
                variant: "default",
            });
        } catch (err) {
            console.error("Error deleting employee:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred during deletion.");
            setEmployees(originalEmployees); // Rollback UI on error
            toast({
                id: "delete-error",
                title: "Deletion Failed",
                description: err instanceof Error ? err.message : "An unexpected error occurred during deletion.",
                variant: "destructive",
            });
        }
    }


    const filteredEmployees = employees.filter(
        (employee) =>
            `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(employee.id).includes(searchTerm.toLowerCase()), // Convert ID to string for includes
    )

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading employee data...</p>
                </div>
            </div>
        )
    }

    // This error display should be consistent if there are no employees or if an error occurred during initial fetch
    if (error && employees.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">Employee Management</h1>
                        <p className="text-muted-foreground font-body">Manage your workforce and employee records</p>
                    </div>
                </div>
                <Link href="/admin-dashboard/employees/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </Link>
            </div>

            {error && employees.length > 0 && ( // Show inline error if some data is present
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="border-0 shadow-modern">
                <CardHeader>
                    <CardTitle className="font-display">All Employees</CardTitle>
                    <CardDescription className="font-body">Search and manage employee records</CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees by name, department, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {employees.length === 0 && !isLoadingData && !error ? ( // Added !error to ensure message only shows when no data AND no error
                        <div className="text-center p-4 text-muted-foreground">No employee records found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee ID</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Department</TableHead>
                                        {/* Removed Status column - re-add only if backend provides real-time status */}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">{employee.id}</TableCell>
                                            <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                                            <TableCell>{employee.department}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* View Details Link (assuming you have a page for this) */}
                                                    <Link href={`/admin-dashboard/employees/${employee.id}`}>
                                                        <Button variant="ghost" size="sm" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {/* Edit Link */}
                                                    <Link href={`/admin-dashboard/employees/edit/${employee.id}`}>
                                                        <Button variant="ghost" size="sm" title="Edit Employee">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {/* Delete AlertDialog Trigger */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Delete Employee">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the employee record (ID: {employee.id}) and remove their data from our servers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}